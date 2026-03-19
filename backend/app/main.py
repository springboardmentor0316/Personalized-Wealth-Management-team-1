from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.routes import auth
from app.routes import profile
from app.routes import goals
from app.models import goal
from fastapi.staticfiles import StaticFiles
from app.routes import investments
from app.routes import transactions


app = FastAPI()

#  CORS MIDDLEWARE (
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create the database tables
Base.metadata.create_all(bind=engine)

@app.get("/")
def home():
    return {"status": "DB connected"}

# Include routes
app.include_router(auth.router)
app.include_router(profile.router)
app.include_router(goals.router)
app.include_router(investments.router)
app.include_router(transactions.router)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")