from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.database import get_db
from app.routes.profile import get_current_user
from app.models.user import User
from app.models.investment import Investment
from app.models.goal import Goal

router = APIRouter(prefix="/analytics", tags=["Analytics"])


# 📊 SUMMARY
@router.get("/summary")
def get_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    investments = db.query(Investment).filter(
        Investment.user_id == current_user.id
    ).all()

    total_invested = sum(float(i.cost_basis or 0) for i in investments)
    current_value = sum(float(i.current_value or 0) for i in investments)
    total_profit = current_value - total_invested

    goals = db.query(Goal).filter(
        Goal.user_id == current_user.id
    ).count()

    return {
        "total_invested": total_invested,
        "current_value": current_value,
        "total_profit": total_profit,
        "total_goals": goals
    }


# 📊 ASSET ALLOCATION
@router.get("/allocation")
def get_allocation(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    result = (
    db.query(
        Investment.asset_type,
        func.sum(Investment.last_price * Investment.units)
    )
    .filter(Investment.user_id == current_user.id)
    .group_by(Investment.asset_type)
    .all()
)

    return [
        {
            "asset_type": r[0],
            "value": float(r[1] or 0)
        }
        for r in result
    ]

@router.get("/performance")
def get_performance(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    investments = db.query(Investment).filter(
        Investment.user_id == current_user.id
    ).all()

    total_invested = sum(float(i.cost_basis or 0) for i in investments)
    current_value = sum(float((i.last_price or 0) * (i.units or 0)) for i in investments)

    profit = current_value - total_invested

    return_percentage = (
        (profit / total_invested) * 100 if total_invested > 0 else 0
    )

    return {
        "total_invested": total_invested,
        "current_value": current_value,
        "profit": profit,
        "return_percentage": round(return_percentage, 2)
    }

@router.get("/goal-progress")
def get_goal_progress(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goals = db.query(Goal).filter(
        Goal.user_id == current_user.id
    ).all()

    investments = db.query(Investment).filter(
        Investment.user_id == current_user.id
    ).all()

    current_value = sum(float((i.last_price or 0) * (i.units or 0)) for i in investments)

    result = []

    for g in goals:
        progress = (current_value / float(g.target_amount)) * 100 if g.target_amount else 0

        result.append({
            "goal_id": g.id,
            "goal_name": g.name,
            "target_amount": float(g.target_amount),
            "current_value": current_value,
            "progress_percentage": round(progress, 2)
        })

    return result