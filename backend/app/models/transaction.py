import enum
from sqlalchemy import Column, Integer, String, Numeric, Enum, ForeignKey, TIMESTAMP
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from app.database import Base

class TransactionType(str, enum.Enum):
    buy = "buy"
    sell = "sell"
    dividend = "dividend"
    contribution = "contribution"
    withdrawal = "withdrawal"

class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    symbol = Column(String)

    type = Column(Enum(TransactionType))
    quantity = Column(Numeric(12, 4))
    price = Column(Numeric(12, 2))
    fees = Column(Numeric(12, 2), default=0)

    executed_at = Column(TIMESTAMP, server_default=func.now())

    user = relationship("User", back_populates="transactions")