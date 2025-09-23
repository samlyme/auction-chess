from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.app.routers import lobbies, users, websocket
from backend.app.dependencies.db import init_db
from backend.app.routers import auth

import game
print("🟡",game)

app = FastAPI()

# This flag will save you from a lot of gray hairs.

# By default, this is True, but all this does is obfuscate routing errors.
# For example, if you defined a trailing slash here in the backend, then send 
# a request from the frontend without a trailing slash, this flag will cause 
# an automatic redirect to the "correct" route. 

# HOWEVER, the redirect will NOT retain any custom headers you set, eg. auth tokens,
# special dependencies. You will look all over the frontend codebase searching 
# for reasons why headers are not being sent properly, when it was really just
# this flag.

# With this flag False, you will see a very clear 404 and know exactly that you 
# have messed up the route. With it True, you don't know whether the route is
# wrong or something else is wrong.

# So please. Keep this flag.
app.router.redirect_slashes = False 

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
app.include_router(lobbies.router)
app.include_router(websocket.router)


for r in app.router.routes:
    print(r)

@app.on_event("startup")
def start_server():
    init_db()

@app.get("/")
async def get():
    return "hi"
