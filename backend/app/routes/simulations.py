from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from datetime import datetime

from app.database import get_db
from app.schemas.simulation import SimulationCreate, SimulationResponse
from app.models.simulation import Simulation
from app.services.simulation_service import run_simulation

router = APIRouter(prefix="/simulations", tags=["Simulations"])


@router.post("/run", response_model=SimulationResponse)
def run_simulation_api(data: SimulationCreate, db: Session = Depends(get_db)):
    result = run_simulation(
        data.monthly_investment,
        data.years,
        data.return_rate
    )

    sim = Simulation(
        user_id=1,  # replace later with JWT user
        goal_id=data.goal_id,
        scenario_name="Custom Simulation",
        assumptions={
            "monthly_investment": data.monthly_investment,
            "years": data.years,
            "return_rate": data.return_rate
        },
        results={
            "future_value": result
        },
        created_at=datetime.utcnow()
    )

    db.add(sim)
    db.commit()

    return {"future_value": result}