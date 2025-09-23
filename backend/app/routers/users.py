from uuid import UUID
from fastapi import APIRouter, HTTPException
from sqlalchemy import select
from backend.app.dependencies.auth import CurrentUserDep
from backend.app.dependencies.db import DBDep
from backend.app.models.models import User
from backend.app.schemas.types import UserCredentials, UserProfile
from backend.app.utils.auth import get_password_hash

from sqlalchemy.exc import IntegrityError

router = APIRouter(prefix="/users")

# TODO: implement username and password validation.
@router.post("")
def add_user(db: DBDep, user_in: UserCredentials) -> UserProfile:
    try:
        password_hash = get_password_hash(user_in.password)
        new_user = User(username=user_in.username, password_hash=password_hash)
        db.add(new_user)
        db.commit()
        return new_user.profile()

    except IntegrityError:
        raise HTTPException(status_code=400, detail="User already exists.")

@router.get("")
def get_user_by_username(db: DBDep, username: str | None = None, uuid: UUID | None = None) -> UserProfile | list[UserProfile]:
    # NOTE: If a uuid is provided, the username is ignored.
    if (not username) and (not uuid): 
        return get_users(db)

    stmt = select(User).where(User.uuid == uuid) if uuid else select(User).where(User.username == username)
    user = db.scalar(stmt)
    
    if user:
        return user.profile()
    else:
        raise HTTPException(status_code=400, detail="User does not exist.")

def get_users(db: DBDep) -> list[UserProfile]:
    return [user.profile() for user in db.scalars(select(User).limit(50))]

@router.get("/me")
def get_current_user(current_user: CurrentUserDep) -> UserProfile:
    return current_user