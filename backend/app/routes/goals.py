from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import logging

from app.database import get_db
from app.models.goal import Goal
from app.schemas.goal import GoalCreate, GoalResponse, GoalStatusUpdate, GoalUpdate
from app.routes.profile import get_current_user
from app.models.user import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/goals", tags=["Goals"])


# CREATE GOAL
@router.post("/", response_model=GoalResponse)
def create_goal(
    goal: GoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    if goal.target_amount <= 0 or goal.monthly_contribution <= 0:
        raise HTTPException(status_code=400, detail="Invalid financial values")

    new_goal = Goal(
        user_id=current_user.id,
        name=goal.name,
        goal_type=goal.goal_type,
        target_amount=goal.target_amount,
        target_date=goal.target_date,
        monthly_contribution=goal.monthly_contribution
    )

    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)

    logger.info(f"Goal created for user_id={current_user.id}")

    return new_goal


# GET ALL GOALS
@router.get("/", response_model=list[GoalResponse])
def get_goals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return db.query(Goal).filter(Goal.user_id == current_user.id).all()

#get particular goal
@router.get("/{goal_id}")
def get_goal(goal_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()

    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    return goal

# UPDATE GOAL (PARTIAL)
@router.put("/{goal_id}", response_model=GoalResponse)
def update_goal(
    goal_id: int,
    goal: GoalUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    existing_goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()

    if not existing_goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    for field, value in goal.dict(exclude_unset=True).items():
        setattr(existing_goal, field, value)

    db.commit()
    db.refresh(existing_goal)

    logger.info(f"Goal updated: {goal_id}")

    return existing_goal


# UPDATE STATUS
@router.patch("/{goal_id}/status", response_model=GoalResponse)
def update_goal_status(
    goal_id: int,
    data: GoalStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()

    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    goal.status = data.status

    db.commit()
    db.refresh(goal)

    logger.info(f"Goal status updated: {goal_id}")

    return goal


# DELETE GOAL
@router.delete("/{goal_id}")
def delete_goal(
    goal_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    goal = db.query(Goal).filter(
        Goal.id == goal_id,
        Goal.user_id == current_user.id
    ).first()

    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    db.delete(goal)
    db.commit()

    logger.info(f"Goal deleted: {goal_id}")

    return {"message": "Goal deleted successfully"}