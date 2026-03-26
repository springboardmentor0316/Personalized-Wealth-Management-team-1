# Personalized-Wealth-Management-team-1
This is a digital wealth management platform for planning goals (retirement, home, education), building portfolios, and tracking progress with market-linked updates and simulations

1. Clone the repository

2. Backend Setup:

    cd backend
    python -m venv .venv
    Activate virtual environment

    Windows:

    .venv\Scripts\activate

    Mac/Linux:

    source .venv/bin/activate

    Install dependencies
    pip install -r requirements.txt

    Create .env file in backend folder
        DATABASE_URL=sqlite:///./test.db
        SECRET_KEY=your_secret_key

    Run backend
        uvicorn app.main:app --reload

    3. Start Redis

        Open new terminal:

        redis-server

    4. Start Celery Worker

            Open another terminal:

            celery -A app.core.celery_app worker --pool=solo --loglevel=info

    5. Frontend Setup
            cd frontend
            npm install
            npm run dev

    6. Open App

        Frontend:

        http://localhost:5173

        Backend:

        http://localhost:8000