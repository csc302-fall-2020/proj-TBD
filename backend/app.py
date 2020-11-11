import datetime
import os
import re

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


@APP.errorhandler(404)
def no_form_exists(error):
    return 'No such form exists!', 404


@APP.errorhandler(406)
def invalid_parameter_combination(error):
    return 'Invalid parameter combination', 406


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
    max_version = max([int(re.sub('\D', '', x['Version'])) for x in form_lst])

    return [x for x in form_lst if int(re.sub('\D', '', x['Version'])) == max_version][0]


def process_query(form_lst, max_form_lst_len=None):
    form_lst = list(form_lst)

    remove_id_col(form_lst)

    if len(form_lst) == 0:
        abort(404)  # missing parameters!

    if max_form_lst_len is not None and len(form_lst) > max_form_lst_len:
        abort(406)  # Too many results

    return form_lst


def get_search_query(parm_dict):
    search_query = {}

    for parm_key in parm_dict:
        if parm_dict[parm_key] is not None:
            search_query[parm_key] = parm_dict

    return search_query


def query_form(parm_dict, restrict_columns=None):
    if restrict_columns is None:
        restrict_columns = {}

    match_forms = FORM_TABLE.find(parm_dict, restrict_columns)

    form_lst = list(match_forms)

    remove_id_col(form_lst)

    if len(form_lst) == 0:
        return abort(404)

    latest_form = get_latest_form(form_lst)

    return latest_form


def get_latest_forms(form_lst):
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

    return latest_form_lst


def delete_form(FormID, Version):
    parm_dict = {}

    parm_dict['FormID'] = FormID
    parm_dict['Version'] = Version

    form_lst = list(FORM_TABLE.find(parm_dict))

    if len(form_lst) == 0:
        return abort(404)

    if len(form_lst) != 1:
        return abort(406)

    form = form_lst[0]

    # Check if is draft

    FORM_TABLE.delete(form)

    return jsonify(success=True), 201


@APP.route('/forms/<FormID>', methods=['GET'])
def process_form(FormID):
    if request.method == 'GET':
        parm_dict = {'FormID': FormID}

        form = query_form(parm_dict)

        return jsonify(form), 200

    else:
        abort(405)


@APP.route('/forms/search', methods=['GET'])
def search_form():
    parm_dict = {}

    parm_dict['FormID'] = request.args.get('FormID')
    search_dict = get_search_query(parm_dict)

    restrict_columns = {'FormID', 'DiagnosticProcedureID', 'Version', 'FormName'}

    match_form = query_form(search_dict, restrict_columns)

    form_lst = process_query(match_form)

    latest_form_lst = get_latest_forms(form_lst)

    latest_form_lst = offset_and_limit(latest_form_lst)

    return jsonify(latest_form_lst), 200


def xml_to_json(file_data):


    return file_data


def get_json_content():
    if 'file' in request.files:  # Uploaded a xml file
        file = request.files['file']

        if file.filename.split('.')[-1] != 'xml':
            abort(406)

        file_data = file.read()

        json_content = xml_to_json(file_data)

    else:  # Uploaded JSON
        json_content = request.json

    return json_content


@APP.route('/forms', methods=['DELETE', 'PATCH', 'POST'])
def create_form():
    json_content = get_json_content()

    if request.method == 'DELETE' or request.method == 'PATCH':
        FormID = json_content['FormID']
        Version = json_content['Version']

        response, response_code = delete_form(FormID, Version)

        if response_code != 201:
            return response, response_code

    if request.method == 'PATCH' or request.method == 'POST':
        FORM_TABLE.insert_one(json_content)

    return jsonify(success=True), 201


def query_response(parm_dict):
    search_query = get_search_query(parm_dict)

    if len(search_query) == 0:
        abort(406)  # missing parameters!

    match_forms = FORM_RESPONSE_TABLE.find(search_query)

    form_lst = process_query(match_forms)

    form_lst = offset_and_limit(form_lst)

    return form_lst


def delete_response(FormResponseID):
    parm_dict = {'FormResponseID': FormResponseID}

    form_response = query_response(parm_dict)

    if len(form_response) > 1:
        abort(406)  # Too many results

    FORM_TABLE.delete(form_response[0])

    return jsonify(success=True), 201


def update_form_response(FormResponseID):
    parm_dict = {}

    parm_dict['FormResponseID'] = FormResponseID

    form_response_lst = list(FORM_RESPONSE_TABLE.find(parm_dict))

    if len(form_response_lst) == 0:
        return abort(404)

    if len(form_response_lst) != 1:
        return abort(406)

    FORM_RESPONSE_TABLE.delete(form_response_lst[0])

    create_form_response()

    return jsonify(success=True), 201


@APP.route('/form-responses/<FormResponseID>', methods=['GET', 'PATCH', 'DELETE'])
def process_response(FormResponseID):
    if request.method == 'GET':
        parm_dict = {'FormResponseID': FormResponseID}

        form_response = query_response(parm_dict)

        form = query_form({'FormID': form_response.json['FormID']})

        return jsonify({'form': form, 'form-response': form_response}), 200

    elif request.method == 'PATCH':
        return update_form_response(FormResponseID)

    elif request.method == 'DELETE':
        return delete_response(FormResponseID)

    else:
        abort(405)


@APP.route('/form-responses/<FormID>/form-responses/search')
def search_response(FormID):
    parm_dict = {}

    parm_dict['FormID'] = FormID
    parm_dict['FormFillerID'] = request.args.get('FormFillerID')
    parm_dict['DiagnosticProcedureID'] = request.args.get('DiagnosticProcedureID')
    parm_dict['PatientID'] = request.args.get('PatientID')
    parm_dict['FormResponseID'] = request.args.get('FormResponseID')

    form_response = query_response(parm_dict)

    form = query_form({'FormID': FormID})

    return jsonify({'form': form.json, 'form-response': form_response}), 200


@APP.route('/form-responses', methods=['POST'])
def create_form_response():
    # Can only upload JSON
    FORM_RESPONSE_TABLE.insert_one(request.json)
    return jsonify(success=True), 201


if __name__ == '__main__':
    APP.run(debug=True)
