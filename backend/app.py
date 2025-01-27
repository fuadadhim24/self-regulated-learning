from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from utils.db import mongo
from routes.auth_routes import auth_bp
from routes.board_routes import board_bp
from routes.user_routes import user_bp
from routes.course_routes import course_bp
import os
from utils.db import init_db

app = Flask(__name__)
CORS(app)

# Allow requests from frontend (allow credentials for cookies)
CORS(app, origins=["http://localhost:3000"], methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"], supports_credentials=True)
# MongoDB configuration
app.config["MONGO_URI"] = "mongodb://localhost:27017/srl_db"
init_db(app)

# Load configuration
app.config.from_object("config.Config")

mongo.init_app(app)

# Test connection
with app.app_context():
    try:
        print("Testing MongoDB connection...")
        print("Collections:", mongo.db.list_collection_names())
    except Exception as e:
        print("Error connecting to MongoDB:", str(e))

# Initialize JWTManager
jwt = JWTManager(app)

# Register blueprints for routes
app.register_blueprint(auth_bp)
app.register_blueprint(board_bp)
app.register_blueprint(user_bp)
app.register_blueprint(course_bp)

@app.before_request
def list_routes():
    print("Available Endpoints:")
    for rule in app.url_map.iter_rules():
        methods = ','.join(rule.methods)
        print(f"{rule.endpoint}: {rule.rule} [{methods}]")

if __name__ == "__main__":
    list_routes()

    list_routes()

    app.run(debug=True)
