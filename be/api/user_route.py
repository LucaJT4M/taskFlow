from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from be.services.user_service import User_Service
from be.schemas.user_schema import UserCreate, UserResponse
from be.core.db import get_db

router = APIRouter(prefix="/users", tags=["Users"])

service = User_Service()

@router.post("", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """Erstellt User in DB"""
    try:
        return service.create_user(db, user.username, user.password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("", response_model=list[UserResponse])
def get_users(db: Session = Depends(get_db)):
    """Returnt alle User in der DB"""
    try:
        return service.get_users(db)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))