from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional


class PromptCreate(BaseModel):
    title: str = Field(..., min_length=3, max_length=255)
    content: str = Field(..., min_length=20)
    complexity: int = Field(..., ge=1, le=10)

    @field_validator("title")
    @classmethod
    def title_not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Title must not be blank")
        return v.strip()

    @field_validator("content")
    @classmethod
    def content_not_blank(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Content must not be blank")
        return v.strip()


class PromptResponse(BaseModel):
    id: int
    title: str
    content: str
    complexity: int
    created_at: datetime
    view_count: Optional[int] = 0

    class Config:
        from_attributes = True


class PromptListItem(BaseModel):
    id: int
    title: str
    complexity: int
    created_at: datetime

    class Config:
        from_attributes = True