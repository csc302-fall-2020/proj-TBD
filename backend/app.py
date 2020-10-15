import datetime
import os

from flask import Flask, Response, request, jsonify
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

# This is for testing and should be removed in the future
@app.route('/test', methods=['GET', 'POST'])
def test_route():
    if request.method == 'GET':
        return jsonify(success=True)
    else:
        return jsonify(success=True, body=request.get_json())