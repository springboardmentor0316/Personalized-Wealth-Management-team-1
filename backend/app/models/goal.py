from sqlalchemy import Column, Integer, Enum, ForeignKey, Numeric, Date, TIMESTAMP
from sqlalchemy.sql import func
from app.database import Base
import enum
from pydantic import BaseModel
from datetime import date

class GoalType(enum.Enum):
    retirement = "retirement"
    home = "home"
    education = "education"
    car = "car"
    travel = "travel"
    medical = "medical"
    emergency = "emergency"
    wedding = "wedding"
    custom = "custom"

class GoalStatus(enum.Enum):
    active = "active"
    paused = "paused"
    completed = "completed"

class Goal(Base):
    __tablename__ = "goals"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id"))

    goal_type = Column(Enum(GoalType))

    target_amount = Column(Numeric)

    target_date = Column(Date)

    monthly_contribution = Column(Numeric)

    status = Column(Enum(GoalStatus), default=GoalStatus.active)

    created_at = Column(TIMESTAMP, server_default=func.now())

class GoalCreate(BaseModel):
    goal_type: str
    target_amount: float
    target_date: date
    monthly_contribution: float

class GoalResponse(BaseModel):
    id: int
    goal_type: str
    target_amount: float
    target_date: date
    monthly_contribution: float

    class Config:
        from_attributes = True