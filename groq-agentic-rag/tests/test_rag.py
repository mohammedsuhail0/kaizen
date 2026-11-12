"""End-to-end integration test for document ingestion and agentic RAG querying."""

import json
import pytest
from app.agent import GroqRAGAgent
from app.ingestion import DocumentIngestionPipeline
from app.vector_store import VectorStore

DUMMY_KNOWLEDGE_DOC = """
# Acme Quantum Cloud - Operational Standard & Infrastructure Policy

Acme Quantum Cloud delivers fault-tolerant quantum compute clusters for enterprise simulations.
All user workloads are distributed across superconducting qubit processors located in subterranean data facilities.

## Backup & Disaster Recovery Policy
Acme Quantum Cloud enforces a continuous automated geo-redundant snapshot protocol.
All quantum state matrices and classical control data are backed up every 15 minutes to three geographically isolated cold-storage bunkers (Zurich, Singapore, and Reykjavik).
Recovery Point Objective (RPO) is strictly guaranteed at 15 minutes, and Recovery Time Objective (RTO) is guaranteed under 4 minutes.
All backup archives are encrypted using AES-256-GCM with post-quantum lattice-based key encapsulation.

## Security & Access Control
Access to control planes requires multi-party biometric authorization and hardware security module (HSM) tokens.
Audit logs are immutably written to an append-only distributed ledger verified hourly.
"""


@pytest.mark.asyncio
async def test_agentic_rag_e2e_flow():
    """Verify document ingestion, semantic search, and Groq agent inline citations."""
    vector_store = VectorStore.get_instance()

    # 1. Chunk and Ingest Dummy Knowledge Document
    filename = "acme_quantum_cloud_policy.md"
    records = DocumentIngestionPipeline.chunk_document(
        text=DUMMY_KNOWLEDGE_DOC,
        source_file=filename,
        chunk_size=300,
        chunk_overlap=30,
    )

    assert len(records) >= 1, "Failed to create chunks from dummy document"

    texts = [r["text"] for r in records]
    metadatas = [r["metadata"] for r in records]
    ids = [r["id"] for r in records]

    inserted = vector_store.add_documents(texts=texts, metadatas=metadatas, ids=ids)
    assert inserted == len(records), "Mismatch in inserted chunk count"

    # 2. Verify VectorStore Similarity Search
    search_results = vector_store.similarity_search(
        query="What is the backup snapshot frequency and RPO guarantee?",
        top_k=2,
    )
    assert len(search_results) > 0, "VectorStore returned zero search results"
    assert any("15 minutes" in r["text"] for r in search_results), "Expected backup terms not found in search results"

    # 3. Query the Groq RAG Agent via Streaming Generator
    agent = GroqRAGAgent(vector_store=vector_store)
    query = "What is Acme Quantum Cloud's backup policy, RPO, and encryption method?"

    stream_events = []
    response_tokens = []

    async for sse_raw in agent.run_stream(user_message=query):
        event = json.loads(sse_raw)
        stream_events.append(event)
        if event.get("type") == "token":
            response_tokens.append(event.get("content", ""))

    full_answer = "".join(response_tokens)
    # Normalize unicode spaces and hyphens for robust string verification
    normalized_answer = full_answer.replace("\u202f", " ").replace("\u00a0", " ").replace("\u2011", "-")

    # 4. Assert Agentic Reasoning Steps Occurred
    event_types = [e.get("type") for e in stream_events]
    assert "thought" in event_types, "Agent should yield reasoning thought events"
    assert "tool_call" in event_types, "Agent should have invoked search_knowledge_base"
    assert "done" in event_types, "Agent stream must conclude with done event"

    # 5. Assert Fact-Checking & Inline Citation Standards
    assert normalized_answer.strip() != "", "Agent generated an empty answer"
    assert "15 minutes" in normalized_answer or "15-minute" in normalized_answer, f"Answer missing exact RPO/frequency from document: {normalized_answer}"
    assert "AES-256" in normalized_answer or "encryption" in normalized_answer.lower(), f"Answer missing encryption policy details: {normalized_answer}"
    assert "[Source:" in normalized_answer or "Source:" in normalized_answer, f"Answer must include strict inline citations: {normalized_answer}"
    assert "acme_quantum_cloud_policy" in normalized_answer, f"Citation must reference source filename: {normalized_answer}"
