from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
from dotenv import load_dotenv
from routers.user.user import router as user_router
from routers.user_details.user_details import router as user_details_router
from routers.gigs.gigs import router as gigs_router

load_dotenv()

app = FastAPI(
    title="Workly API",
    description="Backend API for the Workly platform",
    version="0.1.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(user_router, prefix="/users", tags=["users"])
app.include_router(user_details_router, prefix="/user-details", tags=["user-details"])
app.include_router(gigs_router, prefix="/gigs", tags=["gigs"])

@app.get("/", tags=["root"])
async def read_root():
    return {"message": "Welcome to the Workly API"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True) 