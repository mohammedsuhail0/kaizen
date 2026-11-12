"""Bootstrap script to ingest the agency catalog into ChromaDB."""

import os
from pathlib import Path
from app.ingestion import DocumentIngestionPipeline
from app.vector_store import VectorStore


def ingest_agency_catalog():
    """Read and index the agency knowledge base document."""
    doc_path = Path(__file__).parent / "data" / "knowledge_base" / "agency_services_and_packages.md"
    if not doc_path.exists():
        print(f"Error: Knowledge document not found at {doc_path}")
        return

    print(f"Loading document: {doc_path.name}")
    with open(doc_path, "rb") as f:
        file_bytes = f.read()

    records = DocumentIngestionPipeline.process_file(
        file_bytes=file_bytes,
        filename=doc_path.name,
    )

    print(f"Generated {len(records)} semantic chunks.")

    vs = VectorStore.get_instance()
    texts = [r["text"] for r in records]
    metadatas = [r["metadata"] for r in records]
    ids = [r["id"] for r in records]

    inserted = vs.add_documents(texts=texts, metadatas=metadatas, ids=ids)
    print(f"Successfully indexed {inserted} chunks into ChromaDB!")
    print(f"Total chunks in vector database: {vs.count()}")


if __name__ == "__main__":
    ingest_agency_catalog()
