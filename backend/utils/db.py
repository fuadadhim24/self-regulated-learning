from flask_pymongo import PyMongo
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

mongo = PyMongo()

def init_db(app):
    try:
        connection_string = app.config.get('MONGO_URI', '')
        # Logging and dotenv should be handled in app.py
        mongo.init_app(app)
        with app.app_context():
            try:
                mongo.db.command('ping')
                collections = mongo.db.list_collection_names()
            except ConnectionFailure as e:
                raise
            except ServerSelectionTimeoutError as e:
                raise
    except Exception as e:
        raise
