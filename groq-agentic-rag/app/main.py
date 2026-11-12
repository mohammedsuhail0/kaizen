"""FastAPI application providing document ingestion and SSE agentic chat streaming."""

import json
from contextlib import asynccontextmanager
from typing import Any, Dict, List, Optional
from fastapi import FastAPI, File, HTTPException, UploadFile, status
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from sse_starlette.sse import EventSourceResponse

from app.agent import GroqRAGAgent
from app.config import get_settings
from app.ingestion import DocumentIngestionPipeline
from app.vector_store import VectorStore


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan context: verify Groq and VectorStore connectivity at startup."""
    settings = get_settings()
    try:
        vs = VectorStore.get_instance()
        chunk_count = vs.count()
        print(f"[Startup] VectorStore initialized. Current indexed chunks: {chunk_count}")
    except Exception as e:
        print(f"[Startup Error] Failed to initialize VectorStore: {e}")

    try:
        agent = GroqRAGAgent()
        # Verify Groq connectivity with a minimal call
        test_resp = agent.client.chat.completions.create(
            model=settings.FAST_MODEL,
            messages=[{"role": "user", "content": "ping"}],
            max_tokens=2,
        )
        print(f"[Startup] Groq API connected successfully. Model: {settings.AGENT_MODEL}")
    except Exception as e:
        print(f"[Startup Warning] Groq API connectivity check failed: {e}")

    yield

    print("[Shutdown] Cleaning up resources...")


app = FastAPI(
    title="Groq Agentic RAG API",
    description="Ultra-low-latency Agentic RAG powered by Groq, FastEmbed, and ChromaDB.",
    version="1.0.0",
    lifespan=lifespan,
)

# Enable CORS for local dev and production frontend clients
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request & Response Models
class TextIngestRequest(BaseModel):
    text: str = Field(..., min_length=10, description="Raw text to chunk and index")
    source_name: str = Field(default="direct_input", description="Identifier for citation tracking")
    extra_metadata: Optional[Dict[str, Any]] = Field(default=None, description="Custom metadata attributes")


class ChatStreamRequest(BaseModel):
    query: str = Field(..., min_length=1, description="Client question or inquiry")
    history: Optional[List[Dict[str, str]]] = Field(
        default=None, description="Recent conversation turns [{'role': 'user'|'assistant', 'content': '...'}]"
    )


class HealthResponse(BaseModel):
    status: str
    groq_connected: bool
    total_indexed_chunks: int
    agent_model: str
    embedding_model: str


@app.get("/api/v1/health", response_model=HealthResponse, tags=["System"])
async def health_check():
    """Verify system health, Groq API accessibility, and vector store chunk count."""
    settings = get_settings()
    vs = VectorStore.get_instance()
    groq_ok = False
    try:
        agent = GroqRAGAgent()
        agent.client.chat.completions.create(
            model=settings.FAST_MODEL,
            messages=[{"role": "user", "content": "1"}],
            max_tokens=1,
        )
        groq_ok = True
    except Exception:
        groq_ok = False

    return HealthResponse(
        status="healthy" if groq_ok else "degraded",
        groq_connected=groq_ok,
        total_indexed_chunks=vs.count(),
        agent_model=settings.AGENT_MODEL,
        embedding_model=settings.EMBEDDING_MODEL,
    )


@app.post("/api/v1/ingest/file", status_code=status.HTTP_201_CREATED, tags=["Ingestion"])
async def ingest_file(file: UploadFile = File(...)):
    """Upload and ingest a document (.pdf, .md, .txt) into the vector knowledge base."""
    allowed_extensions = (".pdf", ".txt", ".md", ".markdown", ".json", ".csv")
    if not file.filename or not file.filename.lower().endswith(allowed_extensions):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Unsupported file type. Supported formats: {', '.join(allowed_extensions)}",
        )

    try:
        content = await file.read()
        records = DocumentIngestionPipeline.process_file(
            file_bytes=content,
            filename=file.filename,
        )

        if not records:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="No extractable text found in uploaded document.",
            )

        vs = VectorStore.get_instance()
        texts = [r["text"] for r in records]
        metadatas = [r["metadata"] for r in records]
        ids = [r["id"] for r in records]

        inserted = vs.add_documents(texts=texts, metadatas=metadatas, ids=ids)

        return {
            "status": "success",
            "filename": file.filename,
            "chunks_created": inserted,
            "total_collection_chunks": vs.count(),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ingestion failed: {str(e)}")


@app.post("/api/v1/ingest/text", status_code=status.HTTP_201_CREATED, tags=["Ingestion"])
async def ingest_raw_text(request: TextIngestRequest):
    """Chunk and index raw text directly into ChromaDB with custom metadata."""
    settings = get_settings()
    try:
        records = DocumentIngestionPipeline.chunk_document(
            text=request.text,
            source_file=request.source_name,
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP,
        )

        if not records:
            raise HTTPException(
                status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
                detail="Provided text could not be chunked.",
            )

        # Merge extra metadata if supplied
        if request.extra_metadata:
            for r in records:
                r["metadata"].update(request.extra_metadata)

        vs = VectorStore.get_instance()
        texts = [r["text"] for r in records]
        metadatas = [r["metadata"] for r in records]
        ids = [r["id"] for r in records]

        inserted = vs.add_documents(texts=texts, metadatas=metadatas, ids=ids)

        return {
            "status": "success",
            "source_name": request.source_name,
            "chunks_created": inserted,
            "total_collection_chunks": vs.count(),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Text ingestion failed: {str(e)}")


@app.post("/api/v1/chat/stream", tags=["Agentic RAG"])
async def stream_agent_chat(request: ChatStreamRequest):
    """Stream real-time agent reasoning, tool invocation events, and tokens via Server-Sent Events."""
    agent = GroqRAGAgent()

    async def event_generator():
        try:
            async for sse_item in agent.run_stream(
                user_message=request.query,
                chat_history=request.history,
            ):
                yield {"data": sse_item}
        except Exception as e:
            err_payload = json.dumps({"type": "error", "content": f"Stream generator fault: {str(e)}"})
            yield {"data": err_payload}

    return EventSourceResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={"Cache-Control": "no-cache", "X-Accel-Buffering": "no"},
    )
