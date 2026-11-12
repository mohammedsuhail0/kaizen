"""Document parsing and recursive semantic chunking pipeline."""

import io
import re
from datetime import datetime, timezone
from typing import Any, Dict, List
import pypdf

from app.config import get_settings


class DocumentIngestionPipeline:
    """Parses and chunks documents into semantic units with rich metadata."""

    @staticmethod
    def extract_text_from_pdf(file_bytes: bytes) -> str:
        """Extract clean text content from a PDF binary stream."""
        pdf_file = io.BytesIO(file_bytes)
        reader = pypdf.PdfReader(pdf_file)
        pages_text: List[str] = []
        for i, page in enumerate(reader.pages):
            text = page.extract_text()
            if text and text.strip():
                pages_text.append(f"--- Page {i + 1} ---\n{text.strip()}")
        return "\n\n".join(pages_text)

    @staticmethod
    def extract_text_from_plain(file_bytes: bytes) -> str:
        """Decode plain text or markdown with multiple fallback encodings."""
        for enc in ("utf-8", "utf-8-sig", "latin-1", "cp1252"):
            try:
                return file_bytes.decode(enc).replace("\r\n", "\n")
            except UnicodeDecodeError:
                continue
        return file_bytes.decode("utf-8", errors="replace").replace("\r\n", "\n")

    @classmethod
    def parse_file(cls, file_bytes: bytes, filename: str) -> str:
        """Extract text from supported file types (.pdf, .md, .txt)."""
        lower = filename.lower()
        if lower.endswith(".pdf"):
            return cls.extract_text_from_pdf(file_bytes)
        elif lower.endswith((".txt", ".md", ".markdown", ".json", ".csv")):
            return cls.extract_text_from_plain(file_bytes)
        else:
            # Fallback to plain text decoding
            return cls.extract_text_from_plain(file_bytes)

    @classmethod
    def recursive_split_text(
        cls,
        text: str,
        chunk_size: int = 500,
        chunk_overlap: int = 50,
    ) -> List[str]:
        """Split text recursively by paragraphs, sentences, and words.

        Uses approximate token measurement (~4 chars per token) to keep chunks within chunk_size.
        """
        if not text or not text.strip():
            return []

        # Target character window (~4 characters per token)
        target_chars = chunk_size * 4
        overlap_chars = chunk_overlap * 4

        separators = ["\n\n", "\n", ". ", "? ", "! ", "; ", ", ", " "]

        def _split(txt: str, seps: List[str]) -> List[str]:
            if len(txt) <= target_chars:
                return [txt.strip()] if txt.strip() else []

            if not seps:
                # Force chunking by character if no separators left
                res = []
                start = 0
                while start < len(txt):
                    end = min(start + target_chars, len(txt))
                    res.append(txt[start:end].strip())
                    start += target_chars - overlap_chars
                return [c for c in res if c]

            sep = seps[0]
            remaining_seps = seps[1:]
            parts = txt.split(sep)

            chunks: List[str] = []
            current = ""

            for part in parts:
                candidate = f"{current}{sep}{part}" if current else part
                if len(candidate) <= target_chars:
                    current = candidate
                else:
                    if current:
                        chunks.append(current.strip())
                    if len(part) > target_chars:
                        # Recursively split the oversized part with deeper separators
                        sub_chunks = _split(part, remaining_seps)
                        chunks.extend(sub_chunks)
                        current = ""
                    else:
                        current = part

            if current and current.strip():
                chunks.append(current.strip())

            return [c for c in chunks if c]

        raw_chunks = _split(text, separators)

        # Merge overlapping chunks for context continuity
        if overlap_chars > 0 and len(raw_chunks) > 1:
            merged_chunks: List[str] = []
            for i, chunk in enumerate(raw_chunks):
                if i == 0:
                    merged_chunks.append(chunk)
                else:
                    prev = raw_chunks[i - 1]
                    # Take tail of previous chunk as overlap prefix
                    overlap_prefix = prev[-overlap_chars:] if len(prev) > overlap_chars else prev
                    # Avoid duplicate text
                    if not chunk.startswith(overlap_prefix.strip()):
                        merged_chunks.append(f"... {overlap_prefix.strip()}\n{chunk}")
                    else:
                        merged_chunks.append(chunk)
            return merged_chunks

        return raw_chunks

    @classmethod
    def chunk_document(
        cls,
        text: str,
        source_file: str,
        chunk_size: int = 500,
        chunk_overlap: int = 50,
    ) -> List[Dict[str, Any]]:
        """Split text and generate structured chunk records with preserved metadata."""
        raw_chunks = cls.recursive_split_text(
            text, chunk_size=chunk_size, chunk_overlap=chunk_overlap
        )
        now_iso = datetime.now(timezone.utc).isoformat()

        # Sanitize source filename for clean citation formatting
        clean_source = re.sub(r"[^\w\-_\.]", "_", source_file)

        records: List[Dict[str, Any]] = []
        for idx, chunk_text in enumerate(raw_chunks):
            chunk_id = f"{clean_source}#chunk-{idx:04d}"
            records.append(
                {
                    "id": chunk_id,
                    "text": chunk_text,
                    "metadata": {
                        "source_file": clean_source,
                        "chunk_id": idx,
                        "created_at": now_iso,
                        "char_count": len(chunk_text),
                    },
                }
            )

        return records

    @classmethod
    def process_file(cls, file_bytes: bytes, filename: str) -> List[Dict[str, Any]]:
        """Extract text and produce indexable chunks from uploaded file bytes."""
        settings = get_settings()
        full_text = cls.parse_file(file_bytes, filename)
        return cls.chunk_document(
            text=full_text,
            source_file=filename,
            chunk_size=settings.CHUNK_SIZE,
            chunk_overlap=settings.CHUNK_OVERLAP,
        )
