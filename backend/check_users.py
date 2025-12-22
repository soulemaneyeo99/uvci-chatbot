from sqlalchemy import create_engine, text
import sys
import os

# Add current directory to path
sys.path.append(os.getcwd())

from app.database import Base
from app.models.user import User

# Connect to DB
engine = create_engine("sqlite:///./uvci_chatbot.db")

with engine.connect() as conn:
    result = conn.execute(text("SELECT email, role FROM users"))
    users = result.fetchall()
    
    print(f"Total users: {len(users)}")
    print("-" * 30)
    for u in users:
        print(f"Email: {u[0]} | Role: {u[1]}")
    print("-" * 30)
