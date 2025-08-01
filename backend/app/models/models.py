from datetime import datetime
import uuid as uuid_
from sqlalchemy import UUID, DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column
from app.schemas.types import UserProfile
from app.dependencies.db import Base

class User(Base):
    __tablename__ = "User"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    uuid: Mapped[uuid_.UUID] = mapped_column(UUID, unique=True, nullable=False, default=uuid_.uuid4)
    username: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    password_hash: Mapped[str] = mapped_column(String, nullable=False) # Stores the hashed password
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)

    def profile(self) -> UserProfile:
        return UserProfile(uuid=self.uuid, username=self.username, created_at=self.created_at)

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', password_hash='{self.password_hash}')>"