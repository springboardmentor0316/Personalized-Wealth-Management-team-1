from app.core.celery_app import celery_app
from app.database import SessionLocal
from app.services.price_updater import update_all_prices



@celery_app.task
def update_prices_task():
    db = SessionLocal()
    try:
        update_all_prices(db)
        print("Prices updated by Celery")
    finally:
        db.close()