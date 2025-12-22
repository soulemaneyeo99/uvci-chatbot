from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    role = Column(String, default="student")  # 'admin' or 'student'
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    # Password reset fields
    reset_token = Column(String, nullable=True, index=True)
    reset_token_expires = Column(DateTime(timezone=True), nullable=True)
    
    # UVCI Credentials (Encrypted)
    uvci_username = Column(String, nullable=True)
    uvci_password_encrypted = Column(String, nullable=True)
