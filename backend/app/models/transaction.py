import enum
from sqlalchemy import Column, Integer, String, Numeric, Enum, ForeignKey, TIMESTAMP, CheckConstraint
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

    __table_args__ = (
        CheckConstraint("quantity > 0", name="check_quantity_positive"),
        CheckConstraint("price >= 0", name="check_price_non_negative"),
        CheckConstraint("fees >= 0", name="check_fees_non_negative"),
    )

    id = Column(Integer, primary_key=True, index=True)

    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)

    investment_id = Column(Integer, ForeignKey("investments.id", ondelete="CASCADE"), nullable=True)

    symbol = Column(String(20), index=True, nullable=False)

    type = Column(
        Enum(TransactionType, name="transaction_type_enum"),
        nullable=False
    )

    quantity = Column(Numeric(12, 4), nullable=False)
    price = Column(Numeric(12, 2), nullable=False)
    fees = Column(Numeric(12, 2), default=0)

    executed_at = Column(TIMESTAMP, server_default=func.now())
    created_at = Column(TIMESTAMP, server_default=func.now())

    # Relationships
    user = relationship("User", back_populates="transactions")
    investment = relationship("Investment", back_populates="transactions")

    @property
    def total_amount(self):
        return float(self.quantity * self.price + self.fees)