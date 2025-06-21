from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select
from app.dependencies.db import SessionDep
from app.models.models import User
from app.core.types import UserIn, UserOut
from app.utils.auth import get_password_hash

from sqlalchemy.exc import IntegrityError

router = APIRouter(prefix="/users")

@router.post("/")
def add_user(db: SessionDep, user_in: UserIn) -> UserOut:
    try:
        password_hash = get_password_hash(user_in.password)
        db.add(User(username=user_in.username, passwordHash=password_hash))
        db.commit()
        return UserOut(username=user_in.username)
    except IntegrityError:
        raise HTTPException(status_code=400, detail="User already exists.")

@router.get("/")
def get_user(db: SessionDep, username: str | None = None) -> UserOut | list[UserOut]:
    if not username: return get_users(db)

    stmt = select(User).where(User.username == username)
    user = db.scalar(stmt)
    
    if user:
        return UserOut(username=user.username)
    else:
        raise HTTPException(status_code=400, detail="User does not exist.")

def get_users(db: SessionDep) -> list[UserOut]:
    out: list[UserOut] = []

    for user in db.scalars(select(User)):
        out.append(UserOut(username=user.username))
        print(user)
    
    return out
    

# @router.put("/")
# def update_user(db: SessionDep, user_in: UserIn) -> UserOut:
    