"""Tool schemas and execution methods for Groq native function calling."""

import json
from typing import Any, Dict, List
from app.vector_store import VectorStore

# Groq / OpenAI compatible JSON schemas for agent function calling
AVAILABLE_TOOLS: List[Dict[str, Any]] = [
    {
        "type": "function",
        "function": {
            "name": "search_knowledge_base",
            "description": (
                "Search the official knowledge base for services, turnarounds, packages, "
                "deliverables, pricing, tech stack, commercial terms, and past projects. "
                "Always use targeted semantic keywords for high-precision retrieval."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "query": {
                        "type": "string",
                        "description": "Specific search query keywords or question.",
                    },
                    "top_k": {
                        "type": "integer",
                        "description": "Number of relevant chunks to retrieve (1 to 8). Default is 4.",
                        "default": 4,
                    },
                },
                "required": ["query"],
            },
        },
    },
    {
        "type": "function",
        "function": {
            "name": "read_chunk_detail",
            "description": (
                "Retrieve the full, unabbreviated text of a specific chunk by its chunk ID "
                "when more surrounding context or exact technical detail is needed."
            ),
            "parameters": {
                "type": "object",
                "properties": {
                    "chunk_id": {
                        "type": "string",
                        "description": "The exact ID of the chunk to read (e.g., 'services_catalog.md#chunk-0002').",
                    },
                },
                "required": ["chunk_id"],
            },
        },
    },
]


def execute_search_knowledge_base(
    query: str, top_k: int = 4, vector_store: VectorStore = None
) -> str:
    """Execute vector similarity search and format chunks for LLM ingestion."""
    vs = vector_store or VectorStore.get_instance()
    results = vs.similarity_search(query=query, top_k=top_k)

    if not results:
        return "No relevant documents found in the knowledge base for this query."

    formatted_chunks = []
    for r in results:
        meta = r.get("metadata", {})
        source = meta.get("source_file", "unknown")
        chunk_id = meta.get("chunk_id", "0")
        score = r.get("score", 0.0)
        formatted_chunks.append(
            f"=== [Source: {source}, Chunk: {chunk_id}] (Relevance Score: {score}) ===\n"
            f"{r.get('text', '').strip()}"
        )

    return "\n\n".join(formatted_chunks)


def execute_read_chunk_detail(
    chunk_id: str, vector_store: VectorStore = None
) -> str:
    """Retrieve full text and metadata for a specific chunk."""
    vs = vector_store or VectorStore.get_instance()
    chunk = vs.get_chunk(chunk_id=chunk_id)

    if not chunk:
        return f"Chunk with ID '{chunk_id}' was not found in the vector database."

    meta = chunk.get("metadata", {})
    source = meta.get("source_file", "unknown")
    chunk_num = meta.get("chunk_id", "0")

    return (
        f"=== Full Detail for [Source: {source}, Chunk: {chunk_num}] ===\n"
        f"{chunk.get('text', '').strip()}"
    )


def execute_tool(name: str, args: Dict[str, Any], vector_store: VectorStore = None) -> str:
    """Route tool call to appropriate execution method."""
    if name == "search_knowledge_base":
        query = args.get("query", "")
        top_k = int(args.get("top_k", 4))
        return execute_search_knowledge_base(query=query, top_k=top_k, vector_store=vector_store)
    elif name == "read_chunk_detail":
        chunk_id = args.get("chunk_id", "")
        return execute_read_chunk_detail(chunk_id=chunk_id, vector_store=vector_store)
    else:
        return f"Error: Unknown tool '{name}'."
