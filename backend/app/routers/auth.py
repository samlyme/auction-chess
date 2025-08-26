from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
import jwt
from sqlalchemy import select

from app.schemas.types import JWTPayload, TokenResponse
from app.dependencies.auth import AuthDep
from app.dependencies.db import DBDep
from app.models.models import User
from app.utils.auth import decode_jwt, encode_jwt, verify_password

router = APIRouter(prefix="")

@router.get("/auth")
async def auth_test(token: AuthDep):
    credentials_exception = HTTPException(
        status_code=401,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload: JWTPayload = decode_jwt(token)

        uuid = payload.sub
        if uuid is None:
            raise credentials_exception
    except jwt.InvalidTokenError:
        raise credentials_exception

    return token

@router.post("/token")
async def login(db_session: DBDep, form_data: Annotated[OAuth2PasswordRequestForm, Depends()]) -> TokenResponse:
    stmt = select(User).where(User.username == form_data.username)
    user: User | None = db_session.scalar(stmt)

    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect username or password") 
    
    # OAuth spec
    return TokenResponse(access_token=encode_jwt(user), token_type="bearer")
        