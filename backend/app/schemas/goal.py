from pydantic import BaseModel, Field, validator
from datetime import date, datetime
from enum import Enum
from decimal import Decimal
from typing import Optional


class GoalTypeEnum(str, Enum):
    retirement = "retirement"
    home = "home"
    education = "education"
    car = "car"
    travel = "travel"
    medical = "medical"
    emergency = "emergency"
    wedding = "wedding"
    custom = "custom"


class GoalStatusEnum(str, Enum):
    active = "active"
    paused = "paused"
    completed = "completed"


# CREATE
class GoalCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    goal_type: GoalTypeEnum
    target_amount: Decimal = Field(gt=0)
    target_date: date
    monthly_contribution: Decimal = Field(gt=0)

    @validator("target_date")
    def validate_date(cls, v):
        if v <= date.today():
            raise ValueError("Target date must be in the future")
        return v


# UPDATE
class GoalUpdate(BaseModel):
    name: Optional[str] = None
    goal_type: Optional[GoalTypeEnum] = None
    target_amount: Optional[Decimal] = None
    target_date: Optional[date] = None
    monthly_contribution: Optional[Decimal] = None


# STATUS UPDATE
class GoalStatusUpdate(BaseModel):
    status: GoalStatusEnum


# RESPONSE
class GoalResponse(BaseModel):
    id: int
    name: str
    goal_type: GoalTypeEnum
    target_amount: Decimal
    target_date: date
    monthly_contribution: Decimal
    status: GoalStatusEnum
    created_at: datetime
    progress: Optional[float] = None

    class Config:
        from_attributes = True