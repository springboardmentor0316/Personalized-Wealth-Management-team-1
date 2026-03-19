from pydantic import BaseModel, Field
from datetime import date
from enum import Enum
from decimal import Decimal



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


class GoalCreate(BaseModel):
    goal_type: GoalTypeEnum
    target_amount: Decimal = Field(gt=0)
    target_date: date
    monthly_contribution: Decimal = Field(gt=0)


class GoalResponse(BaseModel):
    id: int
    goal_type: GoalTypeEnum
    target_amount: Decimal
    target_date: date
    monthly_contribution: Decimal

    class Config:
        from_attributes = True