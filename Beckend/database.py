from sqlalchemy import create_engine, Column, Integer, String, Text, DateTime, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime
import os

DATABASE_URL = "sqlite:///./kalakar.db"

engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class Project(Base):
    __tablename__ = "projects"

    id = Column(String, primary_key=True, index=True)
    name = Column(String, default="Untitled Project")
    video_path = Column(String)  # Path to uploaded raw video
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

class TranscriptionJob(Base):
    __tablename__ = "transcription_jobs"

    id = Column(String, primary_key=True, index=True)
    project_id = Column(String, index=True)
    status = Column(String, default="queued")  # queued, processing, completed, failed
    words_data = Column(JSON, nullable=True)   # The resulting transcript JSON
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

class RenderJob(Base):
    __tablename__ = "render_jobs"

    id = Column(String, primary_key=True, index=True)
    project_id = Column(String, index=True)
    status = Column(String, default="queued")
    style = Column(String)
    output_video_path = Column(String, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.datetime.utcnow, onupdate=datetime.datetime.utcnow)

def init_db():
    Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
