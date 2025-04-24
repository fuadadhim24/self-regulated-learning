from flask import Flask, request, make_response
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from utils.db import mongo
from routes.auth_routes import auth_bp
from routes.board_routes import board_bp
from routes.user_routes import user_bp
from routes.course_routes import course_bp
from routes.learningstrat_routes import learningstrat_bp
from routes.attachments import attachments_bp
from routes.study_sessions import study_sessions_bp
import os
from utils.db import init_db
from config import Config
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

app = Flask(__name__)

# Configure CORS
CORS(app, resources={
    r"/*": {  # Allow all routes, not just /api/*
        "origins": ["https://self-regulated-learning.vercel.app", "http://localhost:3000"],
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization", "Access-Control-Allow-Origin", "Access-Control-Allow-Headers", "Access-Control-Allow-Methods"],
        "expose_headers": ["Content-Type", "Authorization"],
        "supports_credentials": True,
        "max_age": 600  # Cache preflight requests for 10 minutes
    }
})

# Load configuration
app.config.from_object("config.Config")

# MongoDB configuration - ensure it's set from environment variable
app.config["MONGO_URI"] = os.getenv("MONGO_URI")
if not app.config["MONGO_URI"]:
    raise ValueError("MONGO_URI environment variable is not set")

# Initialize database
init_db(app)

# Additional configuration
app.config['JWT_SECRET_KEY'] = Config.JWT_SECRET_KEY
app.config['UPLOAD_FOLDER'] = Config.UPLOAD_FOLDER

app.config["JWT_TOKEN_LOCATION"] = ["headers", "cookies"]
app.config["JWT_COOKIE_CSRF_PROTECT"] = False  # optional: for development only
app.config["JWT_ACCESS_TOKEN_EXPIRES"] = 600  # 10 minutes
app.config["JWT_REFRESH_TOKEN_EXPIRES"] = 86400 * 7  # 7 days

# Initialize JWTManager
jwt = JWTManager(app)

# Create upload folder if it doesn't exist
os.makedirs(Config.UPLOAD_FOLDER, exist_ok=True)

# Register blueprints for routes
app.register_blueprint(auth_bp)
app.register_blueprint(board_bp)
app.register_blueprint(user_bp)
app.register_blueprint(course_bp)
app.register_blueprint(learningstrat_bp)
app.register_blueprint(attachments_bp)
app.register_blueprint(study_sessions_bp)

@app.before_request
def list_routes():
    print("Available Endpoints:")
    for rule in app.url_map.iter_rules():
        methods = ','.join(rule.methods)
        print(f"{rule.endpoint}: {rule.rule} [{methods}]")

@app.before_request
def handle_preflight():
    if request.method == "OPTIONS":
        response = make_response()
        response.headers.add("Access-Control-Allow-Origin", "http://localhost:3000")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type, Authorization")
        response.headers.add("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        response.headers.add("Access-Control-Allow-Credentials", "true")
        return response

if __name__ == "__main__":
    list_routes()
    app.run(debug=True)
