from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import logging

from app.database import get_db
from app.routes.profile import get_current_user
from app.models.user import User
from app.models.recommendation import Recommendation
from app.models.investment import Investment  # ✅ NEW
from app.services.recommendation_service import get_allocation

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/recommendations", tags=["Recommendations"])


# CREATE RECOMMENDATION
@router.post("/")
def create_recommendation(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # ✅ Fetch investments
    investments = db.query(Investment).filter(
        Investment.user_id == current_user.id
    ).all()

    # ✅ Pass investments to service
    result = get_allocation(
        current_user.risk_profile,
        investments=investments
    )

    ideal = result.get("ideal", {})
    advice = result.get("advice", "")

    if not ideal:
        raise HTTPException(status_code=400, detail="Invalid allocation")

    total = sum(ideal.values())
    if total != 100:
        raise HTTPException(status_code=500, detail="Allocation must sum to 100")

    rec = Recommendation(
        user_id=current_user.id,
        title=f"{current_user.risk_profile.value.capitalize()} Portfolio Allocation",
        recommendation_text=advice,
        suggested_allocation=ideal,  # ✅ updated
        created_at=datetime.utcnow()
    )

    db.add(rec)
    db.commit()
    db.refresh(rec)

    logger.info(f"Recommendation created for user_id={current_user.id}")

    return {
        "risk_profile": current_user.risk_profile,
        "ideal": ideal,
        "current": result.get("current", {}),
        "rebalance": result.get("rebalance", {}),
        "advice": advice
    }


# GET CURRENT RECOMMENDATION
@router.get("/")
def get_recommendation(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # ✅ Fetch investments
    investments = db.query(Investment).filter(
        Investment.user_id == current_user.id
    ).all()

    # ✅ Pass investments
    result = get_allocation(
        current_user.risk_profile,
        investments=investments
    )

    return {
        "risk_profile": current_user.risk_profile,
        "ideal": result.get("ideal", {}),
        "current": result.get("current", {}),
        "rebalance": result.get("rebalance", {}),
        "advice": result.get("advice", "")
    }


# GET HISTORY
@router.get("/history")
def get_recommendation_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    records = (
        db.query(Recommendation)
        .filter(Recommendation.user_id == current_user.id)
        .order_by(Recommendation.created_at.desc())
        .limit(10)
        .all()
    )

    return [
        {
            "id": r.id,
            "title": r.title,
            "recommendation_text": r.recommendation_text,
            "suggested_allocation": r.suggested_allocation,
            "created_at": r.created_at
        }
        for r in records
    ]