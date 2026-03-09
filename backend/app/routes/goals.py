from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.goal import Goal
from app.schemas.goal import GoalCreate
from app.routes.profile import get_current_user
from app.models.user import User

router = APIRouter(prefix="/goals", tags=["Goals"])

# create goal
@router.post("/")
def create_goal(
    goal: GoalCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    new_goal = Goal(
        user_id=current_user.id,
        goal_type=goal.goal_type,
        target_amount=goal.target_amount,
        target_date=goal.target_date,
        monthly_contribution=goal.monthly_contribution
    )

    db.add(new_goal)
    db.commit()
    db.refresh(new_goal)

    return new_goal

# get all goals
@router.get("/")
def get_goals(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    goals = db.query(Goal).filter(
        Goal.user_id == current_user.id
    ).all()

    return goals

# update goal
@router.put("/{goal_id}")
def update_goal(goal_id: int, goal: GoalCreate, db: Session = Depends(get_db)):

    existing_goal = db.query(Goal).filter(Goal.id == goal_id).first()

    existing_goal.goal_type = goal.goal_type
    existing_goal.target_amount = goal.target_amount
    existing_goal.target_date = goal.target_date
    existing_goal.monthly_contribution = goal.monthly_contribution

    db.commit()

    return existing_goal

# delete goal
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

    return {"message": "Goal deleted"}