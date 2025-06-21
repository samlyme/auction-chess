from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy import select

from app.dependencies.auth import AuthDep
from app.dependencies.db import DBDep
from app.models.models import User
from app.utils.auth import create_jwt_token, verify_password

router = APIRouter(prefix="")

@router.get("/auth")
async def auth_test(token: AuthDep):
    return token

@router.post("/token")
async def login(db_session: DBDep, form_data: Annotated[OAuth2PasswordRequestForm, Depends()]):
    stmt = select(User).where(User.username == form_data.username)
    user = db_session.scalar(stmt)

    if not user or not verify_password(form_data.password, user.passwordHash):
        raise HTTPException(status_code=400, detail="Incorrect username or password") 
    
    # TODO: fix this???
    return {"access_token": create_jwt_token({"sub": user.username}), "token_type": "bearer"}
        