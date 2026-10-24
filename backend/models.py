from datetime import datetime, timezone
from typing import List, Optional

from sqlmodel import Field, Relationship, SQLModel


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


class Category(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    name: str = Field(index=True, unique=True, max_length=50)
    color: str = Field(default="#10B981", max_length=20)
    icon: str = Field(default="zap", max_length=30)
    daily_target_minutes: Optional[int] = Field(default=None, ge=0)
    weekly_target_minutes: Optional[int] = Field(default=None, ge=0)
    is_archived: bool = Field(default=False)
    created_at: Optional[datetime] = Field(default_factory=utc_now)

    sessions: List["TimeSession"] = Relationship(back_populates="category")


class TimeSession(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    category_id: int = Field(foreign_key="category.id", index=True)
    start_time: datetime = Field(default_factory=utc_now, index=True)
    end_time: Optional[datetime] = Field(default=None)
    duration_seconds: Optional[int] = Field(default=None, ge=0)
    note: Optional[str] = Field(default=None, max_length=500)

    category: Optional[Category] = Relationship(back_populates="sessions")
