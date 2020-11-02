import datetime
import os

from flask import Flask, Response, request, jsonify, abort, render_template
from flask_pymongo import PyMongo

APP = Flask(__name__)
APP.config['MONGO_URI'] = 'mongodb://{username}:{password}@{host}/{db}?retryWrites=true&w=majority'.format(username=os.environ['MONGODB_USERNAME'], password=os.environ['MONGODB_PASSWORD'], host=os.environ['MONGODB_HOST'], db=os.environ['MONGODB_DB'])

CLUSTER = PyMongo(APP)
DB = CLUSTER.db
FORM_TABLE = DB.forms
FORM_RESPONSE_TABLE = DB.form_responses

DEFAULT_LIMIT = 20


@APP.route('/')
def index():
    return render_template('index.html')


def remove_id_col(form_lst):
    [x.pop('_id') for x in form_lst]


def offset_and_limit(form_lst):
    offset = request.args.get('offset')
    limit = request.args.get('limit')

    if offset is not None:
        form_lst = form_lst[offset:]
    if limit is not None:
        form_lst = form_lst[:limit]
    else:
        form_lst = form_lst[:DEFAULT_LIMIT]

    return form_lst


def get_latest_form(form_lst):
    max_version = max([float(x['Version']) for x in form_lst])

    return [x for x in form_lst if float(x['Version']) == max_version][0]


@APP.route('/forms/<FormID>', methods=['GET'])
def get_form(FormID):
    match_forms = FORM_TABLE.find({'FormID': int(FormID)})

    form_lst = list(match_forms)

    remove_id_col(form_lst)

    if len(form_lst) == 0:
        return abort(404)

    latest_form = get_latest_form(form_lst)

    return jsonify(latest_form), 200


def query_form(FormID, DiagnosticProcedureID):
    search_query = {}

    if FormID is not None:
        search_query['FormID'] = int(FormID)
    if DiagnosticProcedureID is not None:
        search_query['DiagnosticProcedureID'] = int(DiagnosticProcedureID)

    match_forms = FORM_TABLE.find(search_query, {'FormID', 'DiagnosticProcedureID', 'Version', 'FormName'})

    form_lst = list(match_forms)

    remove_id_col(form_lst)

    if len(form_lst) == 0:
        abort(404)

    # Condense all duplicate FormIDs into a list
    form_dict = {}
    for form in form_lst:
        if form['FormID'] in form_dict:
            form_dict[form['FormID']].append(form)
        else:
            form_dict[form['FormID']] = [form]

    # For each FormID, get the latest version of the form
    latest_form_lst = []
    for formID in form_dict:
        latest_form_lst.append(get_latest_form(form_dict[formID]))

    latest_form_lst = offset_and_limit(latest_form_lst)

    return jsonify(latest_form_lst), 200


def xml_to_json(file_data):


    return file_data


@APP.route('/forms', methods=['GET', 'POST'])
def form_processing():
    if request.method == 'GET':
        FormID = request.args.get('FormID')
        DiagnosticProcedureID = request.args.get('DiagnosticProcedureID')

        return query_form(FormID, DiagnosticProcedureID)

    elif request.method == 'POST':
        if 'file' in request.files:  # Uploaded a xml file
            file = request.files['file']

            if file.filename.split('.')[-1] != 'xml':
                abort(406)

            file_data = file.read()

            json_content = xml_to_json(file_data)

        else:  # Uploaded JSON
            json_content = request.json

        FORM_TABLE.insert_one(json_content)
        return jsonify(success=True), 201


@APP.route('/form-responses/<FormResponseID>', methods=['GET'])
def get_response(FormResponseID):
    match_form_responses = FORM_TABLE.find({'FormResponseID': int(FormResponseID)})

    form_lst = list(match_form_responses)

    remove_id_col(form_lst)

    if len(form_lst) > 1:
        return jsonify({'response': 'invalid response'})

    else:
        return jsonify(form_lst), 200


def query_responses(FormID, FormFillerID, DiagnosticProcedureID, PatientID, FormResponseID):
    search_query = {}

    if FormID is not None:
        search_query['FormID'] = FormID
    if FormFillerID is not None:
        search_query['FormFillerID'] = FormFillerID
    if DiagnosticProcedureID is not None:
        search_query['DiagnosticProcedureID'] = DiagnosticProcedureID
    if PatientID is not None:
        search_query['PatientID'] = PatientID
    if FormResponseID is not None:
        search_query['FormResponseID'] = FormResponseID

    if len(search_query) == 0:
        abort(400)  # missing parameters!

    match_forms = FORM_TABLE.find(search_query)

    form_lst = list(match_forms)

    remove_id_col(form_lst)

    if len(form_lst) == 0:
        abort(404)

    else:
        form_lst = offset_and_limit(form_lst)

        return jsonify(form_lst), 200


@APP.route('/form-responses', methods=['GET', 'POST'])
def response_processing():
    if request.method == 'GET':
        FormID = request.args.get('FormID')
        FormFillerID = request.args.get('FormFillerID')
        DiagnosticProcedureID = request.args.get('DiagnosticProcedureID')
        PatientID = request.args.get('PatientID')
        FormResponseID = request.args.get('FormResponseID')

        return query_responses(FormID, FormFillerID, DiagnosticProcedureID, PatientID, FormResponseID)

    elif request.method == 'POST':
        # Can only upload JSON
        FORM_RESPONSE_TABLE.insert_one(request.json)
        return jsonify(success=True), 201


@APP.route('/test', methods=['GET', 'POST'])
def test_route():
    if request.method == 'GET':
        return jsonify(success=True)
    else:
        return jsonify(success=True, body=request.get_json())

if __name__ == '__main__':
    APP.run(debug=True)
