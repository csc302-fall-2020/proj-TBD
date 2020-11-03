import unittest
import os
from flask import Flask, Response, request, jsonify, abort, render_template
from flask_pymongo import PyMongo
import backend.app as app
from werkzeug import exceptions


class TestDBConnection(unittest.TestCase):
    APP = Flask(__name__)
    APP.config['MONGO_URI'] = 'mongodb://{username}:{password}@{host}/{db}?retryWrites=true&w=majority'.format(
        username=os.environ['MONGODB_USERNAME'], password=os.environ['MONGODB_PASSWORD'],
        host=os.environ['MONGODB_HOST'], db=os.environ['MONGODB_DB'])

    def test_connection(self):
        try:
            CLUSTER = PyMongo(self.APP)
        except:
            self.assertTrue(False, 'Failed to connect to database')

        self.assertTrue(True)

    def test_collections_exit(self):
        CLUSTER = PyMongo(self.APP)

        DB = CLUSTER.db
        FORM_TABLE = DB.forms
        FORM_RESPONSE_TABLE = DB.form_responses

        self.assertTrue(FORM_TABLE is not None and FORM_RESPONSE_TABLE is not None)


class TestDBQueries(unittest.TestCase):
    context = app.APP.app_context()
    context.push()

    app.FORM_TABLE.remove({'FormID': '-2'})
    app.FORM_TABLE.insert_one({'FormName': 'Test1', 'FormID': '-2', 'Version': '1.0'})
    app.FORM_TABLE.insert_one({'FormName': 'Test2', 'FormID': '-2', 'Version': '1.1'})
    app.FORM_TABLE.insert_one({'FormName': 'Test3', 'FormID': '-2', 'Version': '1.13'})

    def test_get_form(self):
        json, response_code = app.get_form('-2')

        json = json.json

        self.assertEqual(json['FormName'], 'Test3')
        self.assertEqual(response_code, 200)

    def test_invalid_form(self):
        with self.assertRaises(exceptions.NotFound):
            app.get_form(-1)

    def test_latest_form_version(self):
        # In the database there are multiple versions for FormID: 0
        # Versions: 1.0, 1.1, 1.13

        json, response_code = app.get_form('-2')

        json = json.json

        self.assertEqual(json['FormName'], 'Test3')
        self.assertEqual(json['Version'], '1.13')
        self.assertEqual(response_code, 200)
