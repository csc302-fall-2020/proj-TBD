import datetime
import os
import re
import xml.etree.ElementTree as ET
import json

from flask import Flask, Response, request, jsonify, abort, render_template
from flask_pymongo import PyMongo

os.environ['MONGODB_HOST'] = 'sdc.fbrhz.mongodb.net'
os.environ['MONGODB_USERNAME'] = 'admin'
os.environ['MONGODB_PASSWORD'] = 'admin'
os.environ['MONGODB_DB'] = 'SDC'

APP = Flask(__name__)
APP.config['MONGO_URI'] = 'mongodb+srv://{username}:{password}@{host}/{db}?retryWrites=true&w=majority'.format(username=os.environ['MONGODB_USERNAME'], password=os.environ['MONGODB_PASSWORD'], host=os.environ['MONGODB_HOST'], db=os.environ['MONGODB_DB'])

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

    form_lst = process_query(match_forms)

    latest_forms = get_latest_forms(form_lst)

    return latest_forms


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

    FormID = request.args.get('FormID')
    if FormID is not None:
        parm_dict['FormID'] = FormID

    search_dict = get_search_query(parm_dict)

    restrict_columns = {'FormID', 'DiagnosticProcedureID', 'Version', 'FormName'}

    form_lst = query_form(search_dict, restrict_columns)

    latest_form_lst = offset_and_limit(form_lst)

    return jsonify(latest_form_lst), 200


def define_sdc_section(attrib):
    section = {}

    section['SectionTitle'] = attrib['title'] if 'title' in attrib else attrib['name']
    section['Questions'] = []

    return section


def define_sdc_question(attrib, carry_over=None):
    question = {}

    question['QuestionType'] = 'trueFalse'
    question['enabledState'] = None
    question['defaultState'] = None
    question['order'] = attrib['order']
    question['QuestionID'] = attrib['ID']
    question['QuestionString'] = attrib['title'] if 'title' in attrib else attrib['name']
    question['DependentQuestions'] = []

    if carry_over is not None:
        question['QuestionString'] = carry_over + '\n' + question['QuestionString']

    return question


def recurse_xml(xml, sections=None, questions=None, last_option=None, carry_over=None):
    """
    Recursively format XML questions and answers into JSON

    :param xml: Dict
        XML snippet to parse into JSON
    :param sections: List of Dict
        Parent container for sections
    :param questions: List of Dict
        Parent container for questions
    :param last_option: String
        Last option/answer parsed for dependency calculation
    :param carry_over: String
        Header title if exists
    :return: List of Dict
        Parsed XML->JSON
    """

    if sections is None:  # Define section container
        sections = []

    for child in xml:  # Cycle through all children ie. possible questions/answers
        section = None
        question = None
        option = None

        tag = child.tag.split('}')[-1]
        attrib = child.attrib

        if tag == 'Section':  # Section Field
            section = define_sdc_section(attrib)

            sections.append(section)

        elif tag == 'Question':  # Question Field
            question = define_sdc_question(attrib, carry_over)
            carry_over = None

            if questions is not None:  # If question is dependent
                question['enabledState'] = [last_option]
                questions['DependentQuestions'].append(question)
            elif 'Questions' in sections:  # If new question in section
                sections['Questions'].append(question)
            else:  # Weird formatting where doesn't have a section
                section = define_sdc_section({'title': attrib['title'], 'name': attrib['name']})
                section['Questions'].append(question)

        elif tag == 'ListItem':  # Answer Field
            if 'options' not in questions:  # Change to appropriate question type and initialize options
                if questions['QuestionType'] == 'trueFalse':
                    # Since question contains options: if default question type change to radio
                    # It would have already changed to MultipleChoice earlier via 'maxSelections' attribute
                    questions['QuestionType'] = 'radio'
                    questions['enabledState'] = questions['enabledState'][0] if questions['enabledState'] is not None else None
                questions['options'] = []

            option = attrib['title'] if 'title' in attrib else attrib['name']

            questions['options'].append(option)

            if 'selected' in attrib and attrib['selected'] == 'true':  # Set default value
                if questions['defaultState'] is not None:
                    questions['defaultState'].append(option)
                else:
                    questions['defaultState'] = [option]

        elif tag == 'ListField' and 'maxSelections' in attrib:  # Definition of non-radio options question
            questions['QuestionType'] = 'multipleChoice'

        elif tag == 'Response':  # Text Field Option
            attrib['ID'] = -1  # Dummy ID
            question = define_sdc_question(attrib, carry_over)
            question['enabledState'] = [last_option] if questions['QuestionType'] == 'multipleChoice' else last_option
            question['QuestionType'] = 'string'

            if questions['enabledState'] == question['enabledState'] and questions['QuestionType'] == 'trueFalse':
                # If unneeded nest -> remove and set the parent to string type
                questions['QuestionType'] = 'string'
            else:
                questions['DependentQuestions'].append(question)

        elif tag == 'DisplayedItem':  # Header text
            carry_over = attrib['title']

        # Set next recurse values
        if section is not None:
            new_section = section
        else:
            new_section = sections

        if question is not None:
            new_question = question
        else:
            new_question = questions

        if option is not None:
            new_option = option
        else:
            new_option = last_option

        recurse_xml(child, new_section, new_question, new_option, carry_over=carry_over)

    return sections


def xml_to_json(file):
    tree = ET.parse(file)
    root = tree.getroot()

    body = None
    FormID = None
    FormName = None
    Version = None

    for child in root:
        if child.tag.split('}')[-1] == 'Body':
            body = child

        else:
            if child.attrib['name'] == 'TemplateID':
                FormID = child.attrib['val']
            elif child.attrib['name'] == 'CAP_ProtocolName':
                FormName = child.attrib['val']
            elif child.attrib['name'] == 'CAP_ProtocolVersion':
                Version = child.attrib['val']

    sections = recurse_xml(body)

    form_json = {
        'FormID': FormID,
        'DiagnosticProcedureID': None,
        'FormName': FormName,
        'Version': Version,
        'FormSections': json.dumps(sections)
    }

    return form_json


def get_json_content():
    if 'file' in request.files:  # Uploaded a xml file
        file = request.files['file']

        if file.filename.split('.')[-1] != 'xml':
            abort(406)

            json_content = xml_to_json(file)

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


@APP.route('/form-responses/<FormResponseID>', methods=['GET'])
def get_response(FormResponseID):
    match_form_responses = FORM_RESPONSE_TABLE.find({'FormResponseID': FormResponseID})

    form_lst = list(match_form_responses)

    remove_id_col(form_lst)

    if len(form_lst) == 0:
        return jsonify({'response': 'Resource not found'}), 404

    if len(form_lst) != 1:
        return jsonify({'response': 'invalid response'})

    else:
        form_response = form_lst[0]

        form_id = form_response['FormID']
        form, response_code = get_form(form_id)

        if response_code != 200:
            abort(response_code)

        return jsonify({'form': form.json, 'form-response': form_response}), 200


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
