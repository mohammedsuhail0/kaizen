# Groq Agentic RAG — Production-Grade AI Sales Architect

A production-ready, ultra-low-latency Agentic RAG (Retrieval-Augmented Generation) application powered by the **Groq API** (`openai/gpt-oss-120b` / `llama-3.3-70b-versatile` & `openai/gpt-oss-20b` / `llama-3.1-8b-instant`), **FastEmbed** (local CPU ONNX embeddings — zero cost, zero network lag), **ChromaDB** (persistent vector storage), and **FastAPI** with Server-Sent Events (SSE) streaming.

Built under strict minimalist engineering principles (**ponytail** style):
- **NO LangChain, NO LlamaIndex, NO multi-layer brittle abstractions.**
- Uses the official `groq` Python SDK with native function calling.
- Direct, transparent agent control loop with full observability and strict inline citations (`[Source: <filename>, Chunk: <id>]`).
- Configured as an **Expert Technical Sales Consultant** that can recommend pre-built bundles or formulate custom service packages with transparent 30% advance / 70% delivery pricing.

---

## Architecture Overview

```
                      [ Client / Frontend / Curl ]
                                   │
                                   ▼ (SSE HTTP Stream)
                  ┌─────────────────────────────────┐
                  │       FastAPI Application       │
                  │   (POST /api/v1/chat/stream)    │
                  └────────────────┬────────────────┘
                                   │
                                   ▼
                   ┌───────────────────────────────┐
                   │        GroqRAGAgent           │
                   │    (llama-3.3-70b-versatile)  │
                   └───────┬───────────────┬───────┘
                           │               │
            Tool Invocation│               │Streaming Tokens
                           ▼               ▼
                ┌─────────────────────┐ [ Client ]
                │ search_knowledge_base│
                └──────────┬──────────┘
                           │
                           ▼
                ┌─────────────────────┐
                │     VectorStore     │
                │  (FastEmbed + ONNX) │ ──<15ms Embedding──► BAAI/bge-small-en-v1.5
                │  (ChromaDB SQLite)  │ ──Persistent DB────► ./data/chroma_db
                └─────────────────────┘
```

---

## Features

1. **Groq Dual-Model Architecture**:
   - **Primary Reasoning & Synthesis**: `llama-3.3-70b-versatile` running at 250+ tokens/sec.
   - **Fast Query Rewriting & Self-Correction**: `llama-3.1-8b-instant` for instantaneous sub-tasks.
2. **Local CPU ONNX Embeddings (`fastembed`)**:
   - Zero API billing and zero network round-trip for embeddings.
   - Computes 384-dimensional dense vectors in <15ms locally on CPU.
3. **Persistent ChromaDB Vector Store**:
   - Cosine-space HNSW index stored in `./data/chroma_db`.
   - Preserves chunk metadata (`source_file`, `chunk_id`, `created_at`, `char_count`).
4. **Agentic Self-Correction Loop**:
   - Decides autonomously whether to search the knowledge base or answer directly.
   - Evaluates search results: if an initial keyword search yields no matches, the agent automatically triggers a semantic query rewrite using the fast model.
5. **Strict Grounding & Inline Citations**:
   - Every factual claim, deliverable, and price must cite its chunk source: `[Source: <filename>, Chunk: <id>]`.
   - Zero hallucinations: explicitly admits if information is missing from the knowledge base.
6. **Consultative Sales Capabilities**:
   - Accurately details Kaizen Software Agency's turnkey packages (Starter ₹4,999, Shop & Cafe ₹6,999, Growth Engine ₹11,999).
   - Generates custom package estimates with the 30% advance split, 70% delivery balance, and turnaround timelines.

---

## Directory Structure

```text
groq-agentic-rag/
├── app/
│   ├── __init__.py
│   ├── config.py           # Pydantic v2 Settings (.env, models, paths)
│   ├── vector_store.py     # FastEmbed ONNX + ChromaDB singleton
│   ├── ingestion.py        # Recursive semantic chunker & PDF/MD parsers
│   ├── tools.py            # Groq function-calling definitions & dispatcher
│   ├── agent.py            # Agentic reasoning loop, self-correction, SSE stream
│   └── main.py             # FastAPI server with SSE streaming endpoints
├── data/
│   ├── chroma_db/          # Persistent ChromaDB vector storage (auto-created)
│   └── knowledge_base/     # Agency service catalog & technical documentation
│       └── agency_services_and_packages.md
├── tests/
│   ├── __init__.py
│   └── test_rag.py         # End-to-end integration test (ingest dummy doc & query)
├── ingest_catalog.py       # Bootstrap script to index agency documents
├── .env                    # Active environment variables
├── .env.example            # Environment template
├── requirements.txt        # Production Python dependencies
└── README.md
```

---

## Quickstart Guide

### 1. Create Virtual Environment & Install Dependencies

```bash
cd groq-agentic-rag

# Create virtual environment
python -m venv venv

# Activate on Windows (PowerShell)
.\venv\Scripts\Activate.ps1

# Or on Linux / macOS
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 2. Configure Environment Variables

The `.env` file is pre-configured with your Groq API key:

```env
GROQ_API_KEY=gsk_your_groq_api_key_here
AGENT_MODEL=llama-3.3-70b-versatile
FAST_MODEL=llama-3.1-8b-instant
CHROMA_PERSIST_DIR=./data/chroma_db
COLLECTION_NAME=knowledge_base
EMBEDDING_MODEL=BAAI/bge-small-en-v1.5
CHUNK_SIZE=500
CHUNK_OVERLAP=50
MAX_AGENT_ITERATIONS=4
```

### 3. Ingest Agency Knowledge Base

Run the catalog ingestion script to populate ChromaDB with the full service catalog, prices, and policies:

```bash
python ingest_catalog.py
```

*Output:*
```text
Loading document: agency_services_and_packages.md
Generated 12 semantic chunks.
Successfully indexed 12 chunks into ChromaDB!
Total chunks in vector database: 12
```

### 4. Start the FastAPI Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

Interactive OpenAPI documentation is available at: **`http://localhost:8000/docs`**

---

## API Reference & Usage

### 1. Health Check
```bash
curl -X GET http://localhost:8000/api/v1/health
```

**Response:**
```json
{
  "status": "healthy",
  "groq_connected": true,
  "total_indexed_chunks": 12,
  "agent_model": "llama-3.3-70b-versatile",
  "embedding_model": "BAAI/bge-small-en-v1.5"
}
```

---

### 2. Upload Document (.pdf, .md, .txt)
```bash
curl -X POST http://localhost:8000/api/v1/ingest/file \
  -F "file=@./data/knowledge_base/agency_services_and_packages.md"
```

---

### 3. Ingest Raw Text with Custom Metadata
```bash
curl -X POST http://localhost:8000/api/v1/ingest/text \
  -H "Content-Type: application/json" \
  -d '{
    "text": "Kaizen provides a 100% money-back guarantee if delivery milestones are not met within 14 business days.",
    "source_name": "special_policy_2026",
    "extra_metadata": {"category": "guarantee"}
  }'
```

---

### 4. SSE Real-Time Agentic Chat Stream
```bash
curl -N -X POST http://localhost:8000/api/v1/chat/stream \
  -H "Content-Type: application/json" \
  -d '{
    "query": "I run a specialty cafe and retail bakery. What package do you recommend, what does it cost, and what are the payment terms?"
  }'
```

**Sample SSE Output Stream:**
```text
data: {"type": "thought", "content": "Analyzing inquiry and evaluating knowledge retrieval..."}
data: {"type": "tool_call", "tool": "search_knowledge_base", "args": {"query": "cafe restaurant bakery shop bundle pricing", "top_k": 4}, "iteration": 1}
data: {"type": "tool_result", "tool": "search_knowledge_base", "output_preview": "=== [Source: agency_services_and_packages.md, Chunk: 0002] ===\n### Bundle 2: Shop & Cafe Bundle (★ Most Popular)\n- Investment: ₹6,999 (One-Time)\n- Payment Split: 30% Advance (₹2,100) | 70% Upon Approval (₹4,899)..."}
data: {"type": "thought", "content": "Synthesizing answer with verified citations and recommendations..."}
data: {"type": "token", "content": "For"}
data: {"type": "token", "content": " your"}
data: {"type": "token", "content": " specialty"}
data: {"type": "token", "content": " cafe"}
data: {"type": "token", "content": " and"}
data: {"type": "token", "content": " retail"}
data: {"type": "token", "content": " bakery,"}
data: {"type": "token", "content": " I"}
data: {"type": "token", "content": " strongly"}
data: {"type": "token", "content": " recommend"}
data: {"type": "token", "content": " the"}
data: {"type": "token", "content": " **Shop"}
data: {"type": "token", "content": " &"}
data: {"type": "token", "content": " Cafe"}
data: {"type": "token", "content": " Bundle**"}
data: {"type": "token", "content": " [Source: agency_services_and_packages.md, Chunk: 0002]."}
...
data: {"type": "done"}
```

---

## Running the Automated Test Suite

Run the full end-to-end integration test (tests ingestion, semantic similarity search, and Groq agent reasoning with citations):

```bash
pytest tests/test_rag.py -v
```
