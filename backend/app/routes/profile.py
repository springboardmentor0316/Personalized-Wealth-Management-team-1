from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordBearer
import shutil
import uuid
import os
import logging

from app.database import get_db
from app.models.user import User
from app.core.jwt import decode_token
from app.schemas.user import UpdateProfile, UserResponse

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/profile", tags=["Profile"])

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")


# ─── GET CURRENT USER ───────────────────────────────────────────────────────

def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db)
):
    payload = decode_token(token)

    if not payload or payload.get("type") != "access":
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    user_id = payload.get("user_id")

    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid token payload")

    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    return user


# ─── GET PROFILE ────────────────────────────────────────────────────────────

@router.get("/", response_model=UserResponse)
def get_profile(current_user: User = Depends(get_current_user)):
    return current_user


# ─── UPDATE PROFILE ─────────────────────────────────────────────────────────

@router.put("/", response_model=UserResponse)
def update_profile(
    data: UpdateProfile,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    for field, value in data.dict(exclude_unset=True).items():
        setattr(current_user, field, value)

    db.commit()
    db.refresh(current_user)

    logger.info(f"Profile updated for user_id={current_user.id}")

    return current_user


# ─── UPLOAD PHOTO ───────────────────────────────────────────────────────────

@router.post("/upload-photo")
def upload_photo(
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    ALLOWED_TYPES = ["image/jpeg", "image/png", "image/jpg"]
    MAX_SIZE = 2 * 1024 * 1024  # 2MB

    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Invalid file type")

    content = file.file.read()
    if len(content) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="File too large")

    file.file.seek(0)

    os.makedirs("uploads", exist_ok=True)

    # Delete old file
    if current_user.profile_picture and os.path.exists(current_user.profile_picture):
        os.remove(current_user.profile_picture)

    file_path = f"uploads/{uuid.uuid4()}_{file.filename}"

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    current_user.profile_picture = file_path
    db.commit()

    logger.info(f"Profile photo updated for user_id={current_user.id}")

    return {
        "message": "Photo uploaded successfully",
        "file_path": file_path
    }