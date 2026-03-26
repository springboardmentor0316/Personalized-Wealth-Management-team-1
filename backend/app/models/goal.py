from sqlalchemy import Column, Integer, String, Enum, ForeignKey, Numeric, Date, TIMESTAMP, CheckConstraint
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
import enum


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

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    name = Column(String(150), nullable=False)

    goal_type = Column(
        Enum(GoalType, name="goal_type_enum"),
        nullable=False
    )

    target_amount = Column(Numeric(12, 2), nullable=False)
    current_amount = Column(Numeric(12, 2), default=0)

    target_date = Column(Date, nullable=False)
    monthly_contribution = Column(Numeric(12, 2), nullable=False)

    status = Column(
        Enum(GoalStatus, name="goal_status_enum"),
        default=GoalStatus.active
    )

    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    __table_args__ = (
        CheckConstraint("target_amount > 0", name="check_target_amount_positive"),
        CheckConstraint("monthly_contribution > 0", name="check_monthly_positive"),
    )

    user = relationship("User", back_populates="goals")
    simulations = relationship("Simulation", back_populates="goal", cascade="all, delete-orphan")

    @property
    def progress_percentage(self):
        if self.target_amount == 0:
            return 0
        return float(self.current_amount / self.target_amount * 100)