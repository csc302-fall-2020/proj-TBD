import datetime
import os
import re
import xml.etree.ElementTree as ET
import json

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
    max_version = max([int(re.sub('\D', '', x['Version'])) for x in form_lst])

    return [x for x in form_lst if int(re.sub('\D', '', x['Version'])) == max_version][0]


@APP.route('/forms/<FormID>', methods=['GET'])
def get_form(FormID):
    match_forms = FORM_TABLE.find({'FormID': FormID})

    form_lst = list(match_forms)

    remove_id_col(form_lst)

    if len(form_lst) == 0:
        return abort(404)

    latest_form = get_latest_form(form_lst)

    return jsonify(latest_form), 200


def query_form(FormID, DiagnosticProcedureID):
    search_query = {}

    if FormID is not None:
        search_query['FormID'] = FormID
    if DiagnosticProcedureID is not None:
        search_query['DiagnosticProcedureID'] = DiagnosticProcedureID

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

            json_content = xml_to_json(file)

        else:  # Uploaded JSON
            json_content = request.json

        FORM_TABLE.insert_one(json_content)
        return jsonify(success=True), 201


@APP.route('/form-responses/<FormResponseID>', methods=['GET'])
def get_response(FormResponseID):
    match_form_responses = FORM_TABLE.find({'FormResponseID': FormResponseID})

    form_lst = list(match_form_responses)

    remove_id_col(form_lst)

    if len(form_lst) != 1:
        return jsonify({'response': 'invalid response'})

    else:
        return jsonify(form_lst[0]), 200


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

    match_forms = FORM_RESPONSE_TABLE.find(search_query)

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


if __name__ == '__main__':
    APP.run(debug=True)
