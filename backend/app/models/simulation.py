from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, JSON, TIMESTAMP, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime

from app.database import Base


class Simulation(Base):
    __tablename__ = "simulations"

    __table_args__ = (
        UniqueConstraint("user_id", "scenario_name", name="unique_user_scenario"),
    )

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    goal_id = Column(Integer, ForeignKey("goals.id", ondelete="SET NULL"), nullable=True, index=True)

    scenario_name = Column(String(150), nullable=False)

    assumptions = Column(JSON, nullable=False)
    results = Column(JSON, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="simulations")
    goal = relationship("Goal", back_populates="simulations")

    def __repr__(self):
        return f"<Simulation id={self.id} scenario={self.scenario_name}>"