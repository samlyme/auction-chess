from typing import Annotated
from fastapi import Depends, HTTPException
from fastapi.security import OAuth2PasswordBearer
import jwt
from sqlalchemy import select

from app.schemas.types import UserProfile
from app.dependencies.db import DBDep
from app.models.models import User
from app.utils.auth import decode_jwt


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

AuthDep = Annotated[str, Depends(oauth2_scheme)]

async def get_current_user(db: DBDep, token: AuthDep) -> UserProfile:
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = decode_jwt(token)
        print("get_current_user token", token)
        print("get_current_user payload", payload)

        username = payload.sub
        if username is None:
            raise credentials_exception
    except jwt.InvalidTokenError:
        raise credentials_exception
    
    stmt = select(User).where(User.username == username)
    user = db.scalar(stmt)
    if user is None:
        raise credentials_exception
    return user.profile()


CurrentUserDep = Annotated[UserProfile, Depends(get_current_user)]