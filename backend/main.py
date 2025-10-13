from fastapi import FastAPI
from contextlib import asynccontextmanager
from database import recipe_collection
from fastapi.middleware.cors import CORSMiddleware

from routes import auth_routes, pantry_routes, recipe_routes, upload_routes, ingredients_routes, feedback_routes




@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Server starting up")
    print("Text index ready")
    yield
    print("Server shutting down ")

app = FastAPI(lifespan=lifespan)

origins = ["http://localhost:3000", "http://localhost:3001", "http://127.0.0.1:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

app.include_router(auth_routes.router)
app.include_router(pantry_routes.router)
app.include_router(recipe_routes.router)
app.include_router(upload_routes.router)
app.include_router(ingredients_routes.router)
app.include_router(feedback_routes.router)

@app.get("/")
def read_root():
    return {"message": "Welcome to the Smart Recipe Generator API"}
