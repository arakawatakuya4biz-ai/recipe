import os
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from database import engine, Base
from routers import inventory, meals, shopping, memos, recipes

# Create tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Recipe App API")

# CORS for development
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# API routes
app.include_router(inventory.router, prefix="/api")
app.include_router(meals.router, prefix="/api")
app.include_router(shopping.router, prefix="/api")
app.include_router(memos.router, prefix="/api")
app.include_router(recipes.router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok"}


# Serve React frontend
frontend_dist = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")

if os.path.exists(frontend_dist):
    app.mount("/assets", StaticFiles(directory=os.path.join(frontend_dist, "assets")), name="assets")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        index_file = os.path.join(frontend_dist, "index.html")
        return FileResponse(index_file)
else:
    @app.get("/")
    def root():
        return {"message": "Recipe API is running. Frontend not built yet."}
