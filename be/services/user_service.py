from be.models.user_model import User
from be.schemas.user_schema import UserUpdate
from passlib.context import CryptContext
from be.security.password import hash_password, verify_password
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
from be.services.task_service import TaskService
from be.models.history_model import History_Task
from be.core.roles import UserRole
from sqlalchemy.orm import Session

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth_2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")
task_service = TaskService()

class UserService:
    def check_for_admin(self, db):
        users = self.get_users(db)
        admin_is_there = any(u.role == UserRole.ADMIN for u in users)
        print("printing users:")
        print(users)

        if not admin_is_there:
            new_admin = users[0]
            user_update = UserUpdate(username=new_admin.username, role=UserRole.ADMIN)

            self.update_user(db, new_admin.username, user_update)

    def get_user_by_username(self, db, username: str):
        return db.query(User).filter(User.username == username).first()

    def authenticate_user(self, db, username: str, password: str):
        user = self.get_user_by_username(db, username)
        if not user:
            return False
        if not verify_password(password, user.hashed_password):
            return False

        return user

    def create_user(self, db, username, password):
        username = username.replace(" ", "") # username has to be without space
        existing = self.get_user_by_username(db, username)

        if existing:
            raise ValueError("User already exists")

        user = User(
            username=username,
            hashed_password=hash_password(password)
        )

        db.add(user)
        db.commit()
        db.refresh(user)
        return user

    def  get_users(self, db: Session) -> list[User]:
        return db.query(User)

    def delete_user(self, db, username):
        try:
            user = self.get_user_by_username(db, username)

            if not user:
                raise ValueError("No User found in DB")

            # delete Tasks of user
            tasks = task_service.get_tasks(db, user)
            for t in tasks:
                task_service.delete_task(db, t.id, user)

            db.query(History_Task).filter(
                History_Task.owner_id == user.id
            ).delete(synchronize_session=False)
    
            db.delete(user)
            db.commit()

            return {"msg": "User deleted successfully"}

        except ValueError as e:
            raise HTTPException(status_code=400, detail=str(e))

    def delete_user_by_id(self, db, id: int):
            try:
                user = self.get_user_by_id(db, id)
    
                if not user:
                    raise ValueError("No User found in DB")
    
                # delete Tasks of user
                tasks = task_service.get_tasks(db, user)
                for t in tasks:
                    task_service.delete_task(db, t.id, user)
    
                db.query(History_Task).filter(
                    History_Task.owner_id == user.id
                ).delete(synchronize_session=False)
        
                db.delete(user)
                db.commit()
    
                return {"msg": "User deleted successfully"}
    
            except ValueError as e:
                raise HTTPException(status_code=400, detail=str(e))

    def update_user(self, db, target_username: str, user_update):
        user = self.get_user_by_username(db, target_username)

        if not user:
            raise ValueError("No User found in DB")

        if user_update.username is None and user_update.password is None:
            raise ValueError("No update fields provided")

        if user_update.username and user_update.username != target_username:
            existing = self.get_user_by_username(db, user_update.username)
            if existing:
                raise ValueError("User already exists")
            user.username = user_update.username

        if user_update.password:
            user.hashed_password = hash_password(user_update.password)

        if user_update.role is not None:
            user.role = user_update.role

        db.commit()
        db.refresh(user)
        return user

    def get_user_by_id(self, db, user_id):
        return db.query(User).filter(User.id == user_id).first()