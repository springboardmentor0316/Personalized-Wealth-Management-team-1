from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime
import logging
from app.database import get_db
from app.schemas.simulation import SimulationCreate, SimulationResponse, SimulationHistoryResponse
from app.models.simulation import Simulation
from app.models.goal import Goal
from app.services.simulation_service import run_simulation
from app.routes.profile import get_current_user
from app.models.user import User

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/simulations", tags=["Simulations"])


# RUN & SAVE
@router.post("/run", response_model=SimulationResponse)
def run_simulation_api(
    data: SimulationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    if data.monthly_investment <= 0 or data.years <= 0:
        raise HTTPException(status_code=400, detail="Invalid input values")

    # Validate goal
    if data.goal_id:
        goal = db.query(Goal).filter(
            Goal.id == data.goal_id,
            Goal.user_id == current_user.id
        ).first()

        if not goal:
            raise HTTPException(status_code=404, detail="Goal not found")

    result = run_simulation(
        data.monthly_investment,
        data.years,
        data.return_rate
    )

    cleaned_timeline = []
    for item in result.get("timeline", []):
        cleaned_timeline.append({
            "year": item["year"],
            "value": float(item["value"])   
        })

   

    scenario_name = data.scenario_name or f"Scenario {datetime.utcnow().strftime('%Y%m%d%H%M%S')}"

    sim = Simulation(
    user_id=current_user.id,
    goal_id=data.goal_id,
    scenario_name=scenario_name,
        assumptions={
            "monthly_investment": float(data.monthly_investment),
            "years": data.years,
            "return_rate": float(data.return_rate)
        },
        results={
            "future_value": float(result["future_value"]),
            "invested": float(result["invested"]),
            "returns": float(result["returns"]),
            "timeline": cleaned_timeline
        },
        created_at=datetime.utcnow()
    )

    db.add(sim)
    db.commit()
    db.refresh(sim)

    logger.info(f"Simulation created for user_id={current_user.id}")

    return {
        "future_value": float(result["future_value"]),
        "invested": float(result["invested"]),
        "returns": float(result["returns"]),
        "timeline": cleaned_timeline
    }


# HISTORY
@router.get("/", response_model=list[SimulationHistoryResponse])
def get_simulations(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    return (
        db.query(Simulation)
        .filter(Simulation.user_id == current_user.id)
        .order_by(Simulation.created_at.desc())
        .all()
    )


# DELETE
@router.delete("/{simulation_id}")
def delete_simulation(
    simulation_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    sim = db.query(Simulation).filter(
        Simulation.id == simulation_id,
        Simulation.user_id == current_user.id
    ).first()

    if not sim:
        raise HTTPException(status_code=404, detail="Simulation not found")

    db.delete(sim)
    db.commit()

    logger.info(f"Simulation deleted: {simulation_id}")

    return {"message": "Simulation deleted"}