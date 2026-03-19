from sqlalchemy import Column, Integer, String, Enum, TIMESTAMP
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base
import enum

class RiskProfile(enum.Enum):
    conservative = "conservative"
    moderate = "moderate"
    aggressive = "aggressive"

class KYCStatus(enum.Enum):
    unverified = "unverified"
    verified = "verified"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)

    risk_profile = Column(Enum(RiskProfile), default=RiskProfile.moderate)
    kyc_status = Column(Enum(KYCStatus), default=KYCStatus.unverified)

    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    date_of_birth = Column(String, nullable=True)
    profile_picture = Column(String, nullable=True)

    created_at = Column(TIMESTAMP, server_default=func.now())

    # Relationships
    goals = relationship("Goal", back_populates="user", cascade="all, delete")
    investments = relationship("Investment", back_populates="user", cascade="all, delete")
    transactions = relationship("Transaction", back_populates="user", cascade="all, delete")