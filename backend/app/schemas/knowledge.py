from datetime import datetime

from pydantic import BaseModel, Field, field_validator

MAX_DOC_CHARS = 100_000


class KnowledgeUpload(BaseModel):
    filename: str = Field(min_length=1, max_length=255)
    content: str = Field(min_length=1, max_length=MAX_DOC_CHARS)

    @field_validator("filename")
    @classmethod
    def _markdown_filename(cls, value: str) -> str:
        name = value.strip()
        if not name.lower().endswith(".md") or name.lower() == ".md":
            raise ValueError("Only .md files are accepted")
        if "/" in name or "\\" in name or any(ord(ch) < 32 for ch in name):
            raise ValueError("Invalid file name")
        return name

    @field_validator("content")
    @classmethod
    def _text_content(cls, value: str) -> str:
        if "\x00" in value:
            raise ValueError("File is not a text file")
        if not value.strip():
            raise ValueError("File is empty")
        return value


class KnowledgeDocumentOut(BaseModel):
    id: str
    filename: str
    char_count: int
    chunk_count: int
    created_at: datetime
