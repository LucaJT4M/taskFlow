from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from be.core.db import get_db
from be.models.user_model import User
from be.security.authorization import require_roles
from be.services.user_service import UserService
from be.schemas.user_schema import UserResponse, UserCreate, UserUpdate
from be.core.roles import UserRole
from be.security.jwt_auth import get_current_username

router = APIRouter(prefix="/user", tags=["Users"])
service = UserService()

@router.post("", response_model=UserResponse)
def create_user(user: UserCreate, db: Session = Depends(get_db)):
    """Erstellt User in DB"""
    try:
        return service.create_user(db, user.username, user.password)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("", response_model=list[UserResponse])
def get_users(db: Session = Depends(get_db), user: User = Depends(require_roles(UserRole.ADMIN))):
    """Returnt alle User in der DB, man muss aber dafür admin sein"""
    try:
        return service.get_users(db)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/{username}")
def delete_user(username: str, db: Session = Depends(get_db), user: User = Depends(require_roles(UserRole.ADMIN))):
    """user delete kann nur von admin ausgeführt werden"""
    try:
        return service.delete_user(db, username)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.delete("/id/{id}")
def delete_user_by_id(id: int, db: Session = Depends(get_db), user: User = Depends(require_roles(UserRole.ADMIN))):
    """user delete kann nur von admin ausgeführt werden"""
    try:
        return service.delete_user_by_id(db, id)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.put("/{username}", response_model=UserResponse)
def update_user(username: str, user_update: UserUpdate, db: Session = Depends(get_db), current_user: User = Depends(get_current_username)):
    """Admin oder User selbst kann user updaten"""
    try:
        target_user = service.get_user_by_username(db, username)

        if not target_user:
            raise HTTPException(status_code=404, detail="User not found")

        is_admin = current_user.role == UserRole.ADMIN.value
        is_own_user = current_user.id == target_user.id

        if not is_admin and not is_own_user:
            raise HTTPException(
                status_code=403,
                detail="You may only update your own user data",
            )

        if not is_admin and user_update.role is not None:
            raise HTTPException(
                status_code=403,
                detail="Only administrators may change roles",
            )

        return service.update_user(db, username, user_update)

    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/{username}", response_model=UserResponse)
def get_user_by_username(username: str, db: Session = Depends(get_db)):
    user = service.get_user_by_username(db, username)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@router.get("/id/{id}", response_model=UserResponse)
def get_user_by_id(id: int, db: Session = Depends(get_db)):
    user = service.get_user_by_id(db, id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user