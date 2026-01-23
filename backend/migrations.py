"""
Database migration runner using Alembic.

Handles existing databases that were created before Alembic was introduced
by automatically stamping the baseline revision.
"""
import subprocess
from sqlalchemy import text


def run_migrations(engine):
    """
    Run Alembic migrations.

    For existing databases without alembic_version table,
    stamps the baseline first before running migrations.
    """
    print("=== Running Alembic Migrations ===", flush=True)

    try:
        with engine.connect() as conn:
            # Check if alembic_version table exists
            result = conn.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables
                    WHERE table_name = 'alembic_version'
                )
            """))
            alembic_exists = result.scalar()

            # Check if users table exists (existing database)
            result = conn.execute(text("""
                SELECT EXISTS (
                    SELECT FROM information_schema.tables
                    WHERE table_name = 'users'
                )
            """))
            users_exists = result.scalar()

        # Stamp baseline for existing databases without alembic
        if not alembic_exists and users_exists:
            print("Existing database without alembic - stamping baseline...", flush=True)
            subprocess.run(["alembic", "stamp", "000_baseline"], check=True)

        # Run migrations
        result = subprocess.run(["alembic", "upgrade", "head"], capture_output=True, text=True)
        print(f"Alembic output: {result.stdout}", flush=True)
        if result.stderr:
            print(f"Alembic stderr: {result.stderr}", flush=True)
        print("=== Migrations Complete ===", flush=True)

        return True

    except Exception as e:
        print(f"Migration error: {e}", flush=True)
        return False
