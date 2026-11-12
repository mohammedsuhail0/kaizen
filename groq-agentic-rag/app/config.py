"""Application configuration using Pydantic v2 Settings."""

from functools import lru_cache
from pathlib import Path
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central application settings loaded from environment or .env file."""

    # Groq API Configuration
    GROQ_API_KEY: str
    AGENT_MODEL: str = "openai/gpt-oss-120b"
    FAST_MODEL: str = "openai/gpt-oss-20b"

    # Vector Database & Embedding Configuration
    CHROMA_PERSIST_DIR: str = "./data/chroma_db"
    COLLECTION_NAME: str = "knowledge_base"
    EMBEDDING_MODEL: str = "BAAI/bge-small-en-v1.5"

    # Ingestion & Chunking
    CHUNK_SIZE: int = 500
    CHUNK_OVERLAP: int = 50
    MAX_AGENT_ITERATIONS: int = 4

    # Server Configuration
    HOST: str = "0.0.0.0"
    PORT: int = 8000

    model_config = SettingsConfigDict(
        env_file=str(Path(__file__).parent.parent / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Return cached singleton instance of Settings."""
    return Settings()
