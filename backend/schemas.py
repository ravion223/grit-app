from typing import Optional

from pydantic import BaseModel, Field


class CategoryCreate(BaseModel):
    name: str = Field(min_length=1, max_length=50)
    color: str = Field(default="#10B981", max_length=20)
    icon: str = Field(default="zap", max_length=30)
    daily_target_minutes: Optional[int] = Field(default=None, ge=0)
    weekly_target_minutes: Optional[int] = Field(default=None, ge=0)


class CategoryUpdate(BaseModel):
    name: Optional[str] = Field(default=None, min_length=1, max_length=50)
    color: Optional[str] = Field(default=None, max_length=20)
    icon: Optional[str] = Field(default=None, max_length=30)
    daily_target_minutes: Optional[int] = Field(default=None, ge=0)
    weekly_target_minutes: Optional[int] = Field(default=None, ge=0)


class SessionUpdate(BaseModel):
    duration_seconds: Optional[int] = Field(default=None, ge=0)
    note: Optional[str] = None


class SessionCreate(BaseModel):
    category_id: int


class DailyLogUpsert(BaseModel):
    mood_score: Optional[int] = Field(default=None, ge=1, le=5)
    focus_level: Optional[int] = Field(default=None, ge=1, le=5)
    is_cookie_jar: Optional[bool] = Field(default=False)
    journal_entry: Optional[str] = Field(default=None, max_length=2000)
