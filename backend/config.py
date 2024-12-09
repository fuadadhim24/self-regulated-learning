import os

class Config:
    MONGO_URI = "mongodb://localhost:27017/srl_db"
    JWT_SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "your-secret-key")
