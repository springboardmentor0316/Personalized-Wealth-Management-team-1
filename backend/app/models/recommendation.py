from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime, JSON, TIMESTAMP
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from datetime import datetime

from app.database import Base


class Recommendation(Base):
    __tablename__ = "recommendations"

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    title = Column(String(150), nullable=False)
    recommendation_text = Column(Text, nullable=False)

    suggested_allocation = Column(JSON, nullable=False)

    version = Column(Integer, default=1)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    user = relationship("User", back_populates="recommendations")

    def __repr__(self):
        return f"<Recommendation id={self.id} user_id={self.user_id}>"