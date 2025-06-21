from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column, DeclarativeBase
from app.dependencies.db import Base

class User(Base):
    __tablename__ = "User"

    id: Mapped[int] = mapped_column(Integer, primary_key=True)
    username: Mapped[str] = mapped_column(String, unique=True, index=True, nullable=False)
    passwordHash: Mapped[str] = mapped_column(String, nullable=False) # Stores the hashed password

    def __repr__(self):
        return f"<User(id={self.id}, username='{self.username}', passwordHash='{self.passwordHash}')>"