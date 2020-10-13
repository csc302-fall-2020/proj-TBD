import datetime
import os

from flask import Flask, Response, request
from flask_mongoengine import MongoEngine

app = Flask(__name__)
app.config['MONGODB_SETTINGS'] = {
    'host': os.environ['MONGODB_HOST'],
    'username': os.environ['MONGODB_USERNAME'],
    'password': os.environ['MONGODB_PASSWORD'],
    'db': 'nametbd'
}

db = MongoEngine()
db.init_app(app)

@app.route("/api")
def index():
    return Response({"status": 200}, mimetype="application/json", status=200)
