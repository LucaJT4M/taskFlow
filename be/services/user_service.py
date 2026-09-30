from sqlalchemy.orm import Session
from be.models.user_model import User
from be.core.db import get_db
from passlib.context import CryptContext
from be.security.password import hash_password, verify_password

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class User_Service:
    def get_user_by_username(self, db, username: str):
        return db.query(User).filter(User.username == username).first()

    def authenticate_user(self, username: str, password: str):
        user = self.get_user_by_username(self.db, username)
        if not user:
            return False
        if not verify_password(password, user.hashed_password):
            return False

        return user

    def create_user(self, db, username, password):
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

    def get_users(self, db):
        return db.query(User)