from sqlalchemy import Column, Integer, Enum, ForeignKey, Numeric, Date, TIMESTAMP
from sqlalchemy.sql import func
from app.database import Base
import enum
from datetime import date
from sqlalchemy.orm import relationship


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

    user = relationship("User", back_populates="goals")


    class Config:
        from_attributes = True