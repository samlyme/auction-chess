from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import games, users, websocket
from app.dependencies.db import init_db
from app.routers import auth

app = FastAPI()

origins = ["http://localhost:3000",
           "http://localhost:3001",
           ]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(auth.router)
app.include_router(games.router)
app.include_router(websocket.router)

@app.on_event("startup")
def start_server():
    init_db()

@app.get("/")
async def get():
    return "hi"
