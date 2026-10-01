from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from be.services.user_service import User_Service
from be.schemas.user_schema import UserCreate, UserResponse, UserUpdate
from be.core.db import get_db
from be.api.auth import get_current_username

router = APIRouter(prefix="/user", tags=["Users"])

service = User_Service()

@router.post("", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """Erstellt User in DB"""
    try:
        return service.create_user(db, user.username, user.password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("", response_model=list[UserResponse])
def get_users(db: Session = Depends(get_db), current_user: str = Depends(get_current_username)):
    """Returnt alle User in der DB"""
    try:
        if current_user == "admin":
            return service.get_users(db)

        raise HTTPException(status_code=403, detail="Not authorized for user output")

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{username}")
def delete_user(username: str, db: Session = Depends(get_db), current_user: str = Depends(get_current_username)):
    """user delete kann nur von admin ausgeführt werden"""
    try:
        if current_user == "admin":
            return service.delete_user(db, username)

        raise HTTPException(status_code=403, detail="Not authorized for user output")

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{username}", response_model=UserResponse)
def update_user(username: str, user: UserUpdate, db: Session = Depends(get_db), current_user: str = Depends(get_current_username)):
    """Admin oder User selbst kann user updaten"""
    try:
        if current_user == "admin" or current_user == username:
            return service.update_user(db, username, user)

        raise HTTPException(status_code=403, detail="Not authorized for user output")

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{username}", response_model=UserResponse)
def get_user_by_username(username: str, db: Session = Depends(get_db), current_user: str = Depends(get_current_username)):
    try:
        if current_user == "admin":
            return service.get_user_by_username(db, username)

        raise HTTPException(status_code=403, detail="Not authorized for user output")
    
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))