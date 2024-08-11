from sqlmodel import SQLModel, create_engine, Session
from app.settings.config import settings

engine = create_engine(settings.DB_URL, echo=True, future=True)

def get_session():
    with Session(engine) as session:
        yield session
