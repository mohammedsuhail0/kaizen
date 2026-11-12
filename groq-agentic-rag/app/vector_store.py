"""Vector store implementation combining FastEmbed and ChromaDB."""

import os
import uuid
from typing import Any, Dict, List, Optional
import chromadb
from chromadb.config import Settings as ChromaSettings
from fastembed import TextEmbedding

from app.config import get_settings


class VectorStore:
    """Thread-safe persistent vector database using ChromaDB with local FastEmbed embeddings."""

    _instance: Optional["VectorStore"] = None

    def __init__(self) -> None:
        settings = get_settings()
        os.makedirs(settings.CHROMA_PERSIST_DIR, exist_ok=True)

        # Initialize local CPU ONNX embedding model (zero network latency)
        self.embedding_model = TextEmbedding(model_name=settings.EMBEDDING_MODEL)

        # Initialize persistent ChromaDB client
        self.chroma_client = chromadb.PersistentClient(
            path=settings.CHROMA_PERSIST_DIR,
            settings=ChromaSettings(anonymized_telemetry=False, is_persistent=True),
        )

        # Get or create cosine similarity collection
        self.collection = self.chroma_client.get_or_create_collection(
            name=settings.COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )

    @classmethod
    def get_instance(cls) -> "VectorStore":
        """Singleton accessor for VectorStore."""
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance

    def _generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Compute embeddings in batches using FastEmbed."""
        if not texts:
            return []
        embeddings = list(self.embedding_model.embed(texts))
        return [emb.tolist() for emb in embeddings]

    def add_documents(
        self,
        texts: List[str],
        metadatas: List[Dict[str, Any]],
        ids: Optional[List[str]] = None,
    ) -> int:
        """Batch embed and upsert documents into ChromaDB.

        Returns total documents added.
        """
        if not texts:
            return 0

        if ids is None:
            ids = [str(uuid.uuid4()) for _ in texts]

        # Generate local ONNX embeddings
        embeddings = self._generate_embeddings(texts)

        # Upsert documents and metadata into persistent ChromaDB
        self.collection.upsert(
            ids=ids,
            embeddings=embeddings,
            documents=texts,
            metadatas=metadatas,
        )
        return len(texts)

    def similarity_search(self, query: str, top_k: int = 4) -> List[Dict[str, Any]]:
        """Perform semantic similarity search using cosine distance.

        Returns structured list of chunks with source metadata and similarity score.
        """
        if self.collection.count() == 0:
            return []

        query_embedding = self._generate_embeddings([query])[0]

        # Ensure we do not request more results than exist in collection
        actual_k = min(top_k, self.collection.count())
        if actual_k <= 0:
            return []

        results = self.collection.query(
            query_embeddings=[query_embedding],
            n_results=actual_k,
            include=["documents", "metadatas", "distances"],
        )

        formatted_results: List[Dict[str, Any]] = []
        if not results or not results["ids"] or not results["ids"][0]:
            return formatted_results

        ids = results["ids"][0]
        docs = results["documents"][0] if results["documents"] else []
        metas = results["metadatas"][0] if results["metadatas"] else []
        distances = results["distances"][0] if results["distances"] else []

        for i in range(len(ids)):
            dist = distances[i] if i < len(distances) else 0.0
            score = round(max(0.0, 1.0 - dist), 4)
            formatted_results.append(
                {
                    "id": ids[i],
                    "text": docs[i] if i < len(docs) else "",
                    "metadata": metas[i] if i < len(metas) else {},
                    "score": score,
                }
            )

        return formatted_results

    def get_chunk(self, chunk_id: str) -> Optional[Dict[str, Any]]:
        """Retrieve full details of a specific chunk by its ID."""
        try:
            res = self.collection.get(
                ids=[chunk_id],
                include=["documents", "metadatas"],
            )
            if res and res["ids"] and len(res["ids"]) > 0:
                return {
                    "id": res["ids"][0],
                    "text": res["documents"][0] if res["documents"] else "",
                    "metadata": res["metadatas"][0] if res["metadatas"] else {},
                }
        except Exception:
            pass
        return None

    def count(self) -> int:
        """Return total indexed chunks in the collection."""
        return self.collection.count()

    def clear(self) -> None:
        """Delete all records from the collection."""
        self.chroma_client.delete_collection(name=get_settings().COLLECTION_NAME)
        self.collection = self.chroma_client.get_or_create_collection(
            name=get_settings().COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"},
        )
