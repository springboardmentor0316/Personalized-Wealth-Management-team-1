import enum
from sqlalchemy import Column, Integer, String, Numeric, Enum, ForeignKey, TIMESTAMP
from sqlalchemy.sql import func
from app.database import Base

class TransactionType(str, enum.Enum):
    buy = "buy"
    sell = "sell"
    deposit = "deposit"
    withdrawal = "withdrawal"

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    investment_id = Column(Integer, ForeignKey("investments.id"), nullable=True)
    transaction_type = Column(Enum(TransactionType), nullable=False)
    symbol = Column(String, nullable=False)
    units = Column(Numeric, nullable=False)
    price = Column(Numeric, nullable=False)
    total_amount = Column(Numeric, nullable=False)
    notes = Column(String, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())
