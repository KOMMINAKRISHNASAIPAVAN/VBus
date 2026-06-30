from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Accept either MySQL or Postgres. Render gives a "postgresql://" URL;
# normalise it to use the psycopg (v3) driver SQLAlchemy expects.
_url = settings.DATABASE_URL
if _url.startswith("postgres://"):
    _url = "postgresql+psycopg://" + _url[len("postgres://"):]
elif _url.startswith("postgresql://") and "+psycopg" not in _url:
    _url = "postgresql+psycopg://" + _url[len("postgresql://"):]

engine = create_engine(
    _url,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=False,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
