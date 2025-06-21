from fastapi import APIRouter, HTTPException
from sqlalchemy import select
from app.dependencies.auth import CurrentUserDep
from app.dependencies.db import DBDep
from app.models.models import User
from app.schemas.types import UserCredentials, UserProfile
from app.utils.auth import get_password_hash

from sqlalchemy.exc import IntegrityError

router = APIRouter(prefix="/users")

@router.post("/")
def add_user(db: DBDep, user_in: UserCredentials) -> UserProfile:
    try:
        password_hash = get_password_hash(user_in.password)
        new_user = User(username=user_in.username, passwordHash=password_hash)
        db.add(new_user)
        db.commit()
        return new_user.profile()

    except IntegrityError:
        raise HTTPException(status_code=400, detail="User already exists.")

@router.get("/")
def get_user(db: DBDep, username: str | None = None) -> UserProfile | list[UserProfile]:
    if not username: return get_users(db)

    stmt = select(User).where(User.username == username)
    user = db.scalar(stmt)
    
    if user:
        return user.profile()
    else:
        raise HTTPException(status_code=400, detail="User does not exist.")

def get_users(db: DBDep) -> list[UserProfile]:
    return [user.profile() for user in db.scalars(select(User))]

# TODO: Proper "get me" route
@router.get("/me")
def get_current_user(current_user: CurrentUserDep) -> UserProfile:
    return current_user