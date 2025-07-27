from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select

from app.schemas.types import TokenResponse
from app.dependencies.auth import AuthDep
from app.dependencies.db import DBDep
from app.models.models import User
from app.utils.auth import encode_jwt, verify_password

router = APIRouter(prefix="")

@router.get("/auth")
async def auth_test(token: AuthDep):
    return token

@router.post("/token")
async def login(db_session: DBDep, form_data: Annotated[OAuth2PasswordRequestForm, Depends()]) -> TokenResponse:
    stmt = select(User).where(User.username == form_data.username)
    user: User | None = db_session.scalar(stmt)

    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(status_code=400, detail="Incorrect username or password") 
    
    # OAuth spec
    return TokenResponse(access_token=encode_jwt(user), token_type="bearer")
        