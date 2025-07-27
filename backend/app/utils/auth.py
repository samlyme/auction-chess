from datetime import datetime, timedelta, timezone
import bcrypt
import jwt
from dotenv import load_dotenv
import os

from app.schemas.types import JWTPayload
from app.models.models import User

load_dotenv()
SECRET_KEY = os.environ["JWT_SECRET"]
if not SECRET_KEY:
    raise Exception("JWT Secret not found")

ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30



def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))

def get_password_hash(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")

def encode_jwt(data: User, expires_delta: timedelta | None = None) -> str:
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(hours=24)

    # NOTE: jwt.encode does not support UUID Objects, so this is a workaround.
    payload = JWTPayload(exp=expire, sub=data.uuid)
    payload_dict = payload.model_dump()
    payload_dict["sub"] = payload_dict["sub"].__str__()
    print("JWT Payload", payload_dict)
    encoded_jwt = jwt.encode(payload_dict, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt
    
def decode_jwt(token: str) -> JWTPayload:
    return JWTPayload(**jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM]))
