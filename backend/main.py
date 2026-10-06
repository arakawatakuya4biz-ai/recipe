import os
os.environ.setdefault("TZ", "Asia/Tokyo")
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from database import engine, Base
from routers import inventory, meals, shopping, memos, recipes

try:
    Base.metadata.create_all(bind=engine)
except Exception as e:
    print(f"[startup] create_all failed (continuing): {e}")

_migrations = [
    "ALTER TABLE inventory_freezer ADD COLUMN quantity VARCHAR DEFAULT ''",
    "ALTER TABLE shopping_items ADD COLUMN sort_order INTEGER DEFAULT 0",
]
for _sql in _migrations:
    try:
        with engine.connect() as _conn:
            _conn.execute(text(_sql))
            _conn.commit()
    except Exception:
        pass

app = FastAPI(title="Recipe App API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(inventory.router, prefix="/api")
app.include_router(meals.router, prefix="/api")
app.include_router(shopping.router, prefix="/api")
app.include_router(memos.router, prefix="/api")
app.include_router(recipes.router, prefix="/api")


@app.get("/api/health")
def health():
    return {"status": "ok"}


frontend_dist = os.path.join(os.path.dirname(__file__), "..", "frontend", "dist")

if os.path.exists(frontend_dist):
    assets_dir = os.path.join(frontend_dist, "assets")
    if os.path.exists(assets_dir):
        app.mount("/assets", StaticFiles(directory=assets_dir), name="assets")

    @app.get("/{full_path:path}")
    def serve_spa(full_path: str):
        file_path = os.path.join(frontend_dist, full_path)
        if os.path.isfile(file_path):
            return FileResponse(file_path)
        return FileResponse(os.path.join(frontend_dist, "index.html"))
else:
    @app.get("/")
    def root():
        return {"message": "Recipe API is running. Frontend not built yet."}
