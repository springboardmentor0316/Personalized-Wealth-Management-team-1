from app.core.celery_app import celery_app
from app.database import SessionLocal
from app.services.price_updater import update_all_prices
import logging

logger = logging.getLogger(__name__)


@celery_app.task(
    name="update_prices_task",
    bind=True,
    autoretry_for=(Exception,),
    retry_backoff=True,
    retry_kwargs={"max_retries": 3},
    time_limit=30,
    soft_time_limit=25
)
def update_prices_task(self):
    db = SessionLocal()

    try:
        logger.info("Starting price update task")

        update_all_prices(db)

        db.commit()   # 🔥 IMPORTANT FIX

        logger.info("Prices updated successfully")

    except Exception as e:
        db.rollback()
        logger.exception(f"Price update failed (retry {self.request.retries})")
        raise self.retry(exc=e)

    finally:
        db.close()