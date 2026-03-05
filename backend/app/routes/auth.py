from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.user import User
from app.schemas.user import UserCreate, UserLogin
from app.core.security import hash_password, verify_password
from app.models.refresh_token import RefreshToken
from app.core.jwt import create_access_token,create_refresh_token
from app.models.user import RiskProfile
from app.models.user import KYCStatus

router = APIRouter(prefix="/auth", tags=["Auth"])

#Register

@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):

    # check if email already exists
    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    #
    new_user = User(
    name=user.name,
    email=user.email,
    password=hash_password(user.password),
    risk_profile=user.risk_profile,
    kyc_status=KYCStatus.unverified
)

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {"message": "User registered successfully"}


# LOGIN

@router.post("/login")
def login(user: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user.email).first()

    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if not verify_password(user.password, db_user.password):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    # create access token
    access_token = create_access_token(
    data={
        "sub": db_user.email,
        "user_id": db_user.id
    }
)

    #Create refresh token
    refresh_token = create_refresh_token(
    data={"sub": db_user.email}
)

    # Store refresh token in database
    db_refresh_token = RefreshToken(
        token=refresh_token,
        user_id=db_user.id
    )
    db.add(db_refresh_token)
    db.commit()

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer"
    }

# Refresh access token
@router.post("/refresh")
def refresh_access_token(token: str, db: Session = Depends(get_db)):
    db_token = db.query(RefreshToken).filter(
        RefreshToken.token == token
    ).first()

    if not db_token:
        raise HTTPException(status_code=401, detail="Invalid refresh token")

    user = db.query(User).filter(
        User.id == db_token.user_id
    ).first()

    if not user:
        raise HTTPException(status_code=401, detail="User not found")

    new_access_token = create_access_token(
        data={"sub": user.email}
    )

    return {
        "access_token": new_access_token,
        "token_type": "bearer"
    }