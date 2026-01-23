from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from database import engine, SessionLocal
import models
from routers import auth, users, admin, two_factor
from security import get_password_hash
from config import settings
import subprocess
import os

# Run Alembic migrations before starting the app
def run_migrations():
    print("=== Running Alembic Migrations ===", flush=True)
    try:
        # Check if alembic_version table exists, if not stamp baseline
        from sqlalchemy import text
        with engine.connect() as conn:
            result = conn.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables
                    WHERE table_name = 'alembic_version'
                )
            """))
            alembic_exists = result.scalar()

            result = conn.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables
                    WHERE table_name = 'users'
                )
            """))
            users_exists = result.scalar()

        if not alembic_exists and users_exists:
            print("Existing database without alembic - stamping baseline...", flush=True)
            subprocess.run(["alembic", "stamp", "000_baseline"], check=True)

        # Run migrations
        result = subprocess.run(["alembic", "upgrade", "head"], capture_output=True, text=True)
        print(f"Alembic output: {result.stdout}", flush=True)
        if result.stderr:
            print(f"Alembic stderr: {result.stderr}", flush=True)
        print("=== Migrations Complete ===", flush=True)
    except Exception as e:
        print(f"Migration error: {e}", flush=True)
        # Don't fail startup, let create_all handle it as fallback
        models.Base.metadata.create_all(bind=engine)

run_migrations()

app = FastAPI(
    title="User Management API",
    description="API for user authentication and management",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_URL],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(users.router)
app.include_router(admin.router)
app.include_router(two_factor.router)


@app.on_event("startup")
def create_admin_user():
    db = SessionLocal()
    try:
        admin = db.query(models.User).filter(models.User.email == settings.ADMIN_EMAIL).first()
        if not admin:
            admin = models.User(
                email=settings.ADMIN_EMAIL,
                hashed_password=get_password_hash(settings.ADMIN_PASSWORD),
                full_name="Admin User",
                is_active=True,
                is_admin=True
            )
            db.add(admin)
            db.commit()
            print(f"Admin user created: {settings.ADMIN_EMAIL}")
        else:
            print("Admin user already exists")
    finally:
        db.close()


@app.get("/")
def root():
    return {
        "message": "User Management API",
        "docs": "/docs",
        "version": "1.0.0"
    }


@app.get("/health")
def health_check():
    return {"status": "healthy"}
