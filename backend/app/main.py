from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import JSONResponse
import os
import logging

from app.database import engine, Base
from app.routes import auth, profile, goals, investments, transactions, simulations, recommendations
import app.models
from app.routes import analytics

# Logging setup
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

app = FastAPI(title="Wealth Management API")

# CORS CONFIG
origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


Base.metadata.create_all(bind=engine)

# UPLOADS
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

# ROOT
@app.get("/")
def home():
    return {"status": "API running"}

# HEALTH CHECK
@app.get("/health")
def health_check():
    return {"status": "healthy"}

# GLOBAL ERROR HANDLER
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Error: {str(exc)}")
    return JSONResponse(
        status_code=500,
        content={"message": "Internal Server Error"}
    )

# ROUTES
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(goals.router)
app.include_router(investments.router)
app.include_router(transactions.router)
app.include_router(simulations.router)
app.include_router(recommendations.router)
app.include_router(analytics.router)