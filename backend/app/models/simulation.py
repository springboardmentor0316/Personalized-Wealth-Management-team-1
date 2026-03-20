# app/models/simulation.py

from sqlalchemy import Column, Integer, String, ForeignKey, DateTime
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime

from app.database import Base


class Simulation(Base):
    __tablename__ = "simulations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    goal_id = Column(Integer, ForeignKey("goals.id"), nullable=True)

    scenario_name = Column(String)

    assumptions = Column(JSONB)
    results = Column(JSONB)

    created_at = Column(DateTime, default=datetime.utcnow)