from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from datetime import datetime, timedelta
from pydantic import BaseModel
import hashlib
import logging

from app.database import get_db
from app.models.user import User, KYCStatus
from app.schemas.user import UserCreate, UserLogin
from app.core.security import hash_password, verify_password
from app.models.refresh_token import RefreshToken
from app.core.jwt import create_access_token, create_refresh_token, decode_token

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/auth", tags=["Auth"])


# ─── UTILITY ────────────────────────────────────────────────────────────────

def hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


# ─── SCHEMAS ────────────────────────────────────────────────────────────────

class RefreshRequest(BaseModel):
    token: str


# ─── REGISTER ───────────────────────────────────────────────────────────────

@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    new_user = User(
        name=user.name,
        email=user.email,
        hashed_password=hash_password(user.password),
        risk_profile=user.risk_profile,
        kyc_status=KYCStatus.unverified
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    logger.info(f"New user registered: {user.email}")

    return {"message": "User registered successfully"}


# ─── LOGIN ───────────────────────────────────────────────────────────────────

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user or not verify_password(user.password, db_user.hashed_password):
        logger.warning(f"Failed login attempt for: {user.email}")
        raise HTTPException(status_code=401, detail="Invalid credentials")

    payload = {
        "sub": db_user.email,
        "user_id": db_user.id
    }

    access_token = create_access_token(data=payload)
    refresh_token = create_refresh_token(data=payload)

    hashed_token = hash_token(refresh_token)

    expires = datetime.utcnow() + timedelta(days=7)

    db_refresh_token = RefreshToken(
        token=hashed_token,
        user_id=db_user.id,
        expires_at=expires
    )

    db.add(db_refresh_token)
    db.commit()

    logger.info(f"User logged in: {db_user.email}")

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }


# ─── REFRESH ACCESS TOKEN ────────────────────────────────────────────────────

@router.post("/refresh")
def refresh_access_token(data: RefreshRequest, db: Session = Depends(get_db)):
    hashed_token = hash_token(data.token)

    db_token = db.query(RefreshToken).filter(
        RefreshToken.token == hashed_token
    ).first()

    if not db_token:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    if db_token.expires_at < datetime.utcnow():
        db.delete(db_token)
        db.commit()
        raise HTTPException(status_code=401, detail="Refresh token expired")

    if hasattr(db_token, "revoked") and db_token.revoked:
        raise HTTPException(status_code=401, detail="Token revoked")

    payload = decode_token(data.token)

    if not payload or payload.get("type") != "refresh":
        raise HTTPException(status_code=401, detail="Invalid token")

    user = db.query(User).filter(User.id == db_token.user_id).first()

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    new_payload = {
        "sub": user.email,
        "user_id": user.id
    }

    new_access_token = create_access_token(data=new_payload)

    logger.info(f"Access token refreshed for user: {user.email}")

    return {
        "access_token": new_access_token,
        "token_type": "bearer"
    }


# ─── LOGOUT ──────────────────────────────────────────────────────────────────

@router.post("/logout")
def logout(data: RefreshRequest, db: Session = Depends(get_db)):
    hashed_token = hash_token(data.token)

    db_token = db.query(RefreshToken).filter(
        RefreshToken.token == hashed_token
    ).first()

    if db_token:
        db.delete(db_token)
        db.commit()
        logger.info(f"User logged out (token revoked)")

    return {"message": "Logged out successfully"}