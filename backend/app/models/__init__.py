# Ensure all models are imported so SQLAlchemy registers them
# This is required for Base.metadata.create_all() to detect all tables

from app.models.user import User
from app.models.goal import Goal
from app.models.investment import Investment
from app.models.transaction import Transaction
from app.models.refresh_token import RefreshToken
from app.models.simulation import Simulation
from app.models.recommendation import Recommendation

__all__ = [
    "User",
    "Goal",
    "Investment",
    "Transaction",
    "RefreshToken",
    "Simulation",
    "Recommendation",
]