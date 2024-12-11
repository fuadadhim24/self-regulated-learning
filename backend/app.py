from flask import Flask
from flask_cors import CORS
from flask_pymongo import PyMongo
from flask_jwt_extended import JWTManager
from routes.board_routes import board_bp
from routes.auth_routes import auth_bp
import os
from utils.db import init_db

app = Flask(__name__)
CORS(app)

# MongoDB configuration
app.config["MONGO_URI"] = "mongodb://localhost:27017/srl_db"
init_db(app)

# JWT configuration
app.config["JWT_SECRET_KEY"] = os.environ.get("JWT_SECRET_KEY", "your-secret-key")
jwt = JWTManager(app)

# Registering blueprints
app.register_blueprint(board_bp)
app.register_blueprint(auth_bp)

@app.before_request
def list_routes():
    print("Available Endpoints:")
    for rule in app.url_map.iter_rules():
        methods = ','.join(rule.methods)
        print(f"{rule.endpoint}: {rule.rule} [{methods}]")

if __name__ == "__main__":
    list_routes()

    app.run(debug=True)