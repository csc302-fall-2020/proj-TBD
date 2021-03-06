from datetime import datetime
import os
import re
import xml.etree.ElementTree as ET
import json
import pymongo
from bson.objectid import ObjectId

from flask import Flask, Response, request, jsonify, abort, render_template
from flask_pymongo import PyMongo

APP = Flask(__name__)
APP.config['MONGO_URI'] = 'mongodb://{username}:{password}@{host}/{db}?retryWrites=true&w=majority'.format(username=os.environ['MONGODB_USERNAME'], password=os.environ['MONGODB_PASSWORD'], host=os.environ['MONGODB_HOST'], db=os.environ['MONGODB_DB'])

CLUSTER = PyMongo(APP)
DB = CLUSTER.db
FORM_TABLE = DB.forms
FORM_RESPONSE_TABLE = DB.form_responses
CLINICIAN_TABLE = DB.clinicians

DEFAULT_LIMIT = 20
METADATA_COLUMNS = {
        'FormID': 1,
        'DiagnosticProcedureID': 1,
        'Version':1,
        'FormName': 1,
        'CreateTime': {"$dateToString": {"date": "$CreateTime"}}
        }


@APP.route('/')
def index():
    return render_template('index.html')


@APP.errorhandler(404)
def no_form_exists(error):
    return 'No such form exists!', 404


@APP.errorhandler(406)
def invalid_parameter_combination(error):
    return 'Invalid parameter combination', 406


@APP.errorhandler(409)
def duplicate_form(error):
    return 'Form already exists!', 409


def remove_id_col(form_lst):
    [x.pop('_id') for x in form_lst]


def offset_and_limit(form_lst):
    offset = request.args.get('offset')
    limit = request.args.get('limit')

    if offset is not None:
        form_lst = form_lst[int(offset):]
    if limit is not None:
        form_lst = form_lst[:int(limit)]
    else:
        form_lst = form_lst[:DEFAULT_LIMIT]

    return form_lst


def get_latest_form(form_lst):
    max_version = max([x['CreateTime'] for x in form_lst])

    return [x for x in form_lst if x['CreateTime'] == max_version][0]


def get_latest_forms(form_lst, key='FormID'):
    # Condense all duplicate FormIDs into a list
    form_dict = {}
    for form in form_lst:
        if form[key] in form_dict:
            form_dict[form[key]].append(form)
        else:
            form_dict[form[key]] = [form]

    # For each FormID, get the latest version of the form
    latest_form_lst = []
    for formID in form_dict:
        latest_form_lst.append(get_latest_form(form_dict[formID]))

    return latest_form_lst


def process_query(form_lst, min_form_lst_len=None, max_form_lst_len=None, get_latest=True, key='FormID', remove_id=True, is_draft=None):
    form_lst = list(form_lst)

    if remove_id:
        remove_id_col(form_lst)

    # When we're processing a list of SDCForm objects, there is no IsDraft property
    if is_draft is True:
        form_lst = [x for x in form_lst if 'IsDraft' in x and x['IsDraft'] is True]

    elif is_draft is False:
        form_lst = [x for x in form_lst if 'IsDraft' not in x or x['IsDraft'] is False]

    if get_latest:
        form_lst = get_latest_forms(form_lst, key)

    if min_form_lst_len is None:
        min_form_lst_len = 1

    if len(form_lst) < min_form_lst_len:
        abort(404)  # missing parameters!

    if max_form_lst_len is not None and len(form_lst) > max_form_lst_len:
        abort(406)  # Too many results

    return form_lst


def get_search_query(parm_dict, error_no_params=True):
    search_query = {}
    to_start_date = lambda x: datetime.strptime(x.split("T")[0], "%Y-%m-%d")
    to_end_date = lambda x: datetime.strptime(x.split("T")[0]+"-23:59:59", "%Y-%m-%d-%H:%M:%S")
    date_query = {}
    for parm_key in parm_dict:
        if parm_dict[parm_key] is not None:
            if parm_key == 'FormName' or parm_key == 'FormFillerID' or parm_key == 'DiagnosticProcedureID' or parm_key == 'PatientID':
                if parm_dict[parm_key] == '.*':
                    pass
                else:
                    search_query[parm_key] = {'$regex': re.compile(parm_dict[parm_key], re.I)}
            elif parm_key == 'StartTime':
                    date_query["$gte"] = to_start_date(parm_dict[parm_key])
            elif parm_key == 'EndTime':
                    date_query["$lte"] = to_end_date(parm_dict[parm_key])
            else:
                search_query[parm_key] = parm_dict[parm_key]
    if date_query:
        search_query['CreateTime'] = date_query
    if error_no_params and len(search_query) == 0:
        abort(406)  # missing parameters!

    return search_query


def query_form(parm_dict, restrict_columns=None, min_form_lst_len=None, max_form_lst_len=None, error_no_params=True, remove_id=True, get_latest=True):
    search_query = get_search_query(parm_dict, error_no_params)
    
    match_forms = FORM_TABLE.find(search_query, restrict_columns).sort("CreateTime", -1)

    form_lst = process_query(match_forms, min_form_lst_len=min_form_lst_len, max_form_lst_len=max_form_lst_len, remove_id=remove_id, get_latest=get_latest)

    return form_lst


def delete_form(FormID=None, Version=None, id=None):
    parm_dict = {}

    if FormID is not None and Version is not None:
        parm_dict['FormID'] = FormID
        parm_dict['Version'] = Version
    elif id is not None:
        parm_dict['_id'] = id
    else:
        abort(404)  # Missing parameters!

    form = query_form(parm_dict, max_form_lst_len=1, remove_id=False)[0]

    # Check if is draft

    FORM_TABLE.delete_one(form)

    return jsonify(success=True), 201


@APP.route('/forms/<FormID>', methods=['GET', 'DELETE'])
def get_form(FormID):
    parm_dict = {}

    if request.method == 'GET':
        parm_dict['FormID'] = FormID

        form = query_form(parm_dict, max_form_lst_len=1)[0]

        return jsonify(form), 200

    elif request.method == 'DELETE':
        Version = request.args.get('Version')

        if Version is None:
            abort(406)  # missing parameters!

        return delete_form(FormID, Version)

    else:
        abort(405)


@APP.route('/forms/search', methods=['GET'])
def search_form():
    parm_dict = {}

    parm_dict['FormName'] = request.args.get('FormName')

    restrict_columns = METADATA_COLUMNS

    form_lst = query_form(parm_dict, restrict_columns=restrict_columns, min_form_lst_len=-1, error_no_params=False)

    latest_form_lst = offset_and_limit(form_lst)

    return jsonify({'items': latest_form_lst, 'total': len(form_lst)}), 200


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
    question['order'] = attrib['order'] if 'order' in attrib else None
    question['QuestionID'] = str(attrib['ID']).replace('.', '_')
    question['QuestionString'] = attrib['title'] if 'title' in attrib else attrib['name'] if 'name' in attrib else ''
    question['DependentQuestions'] = []

    if carry_over is not None:
        question['QuestionString'] = carry_over + '\n' + question['QuestionString']

    return question


def filter_tag(tag):
    return tag.split('}')[-1]


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

        tag = filter_tag(child.tag)
        attrib = child.attrib

        if tag == 'Section':  # Section Field
            section = define_sdc_section(attrib)

            if isinstance(sections, dict):
                if 'Sections' in sections:
                    sections['Sections'].append(section)
                else:
                    sections['Sections'] = [section]
            else:
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


def get_metadata(root):
    body = None
    FormID = None
    FormName = None
    Version = None
    CreateTime = None

    last_child = None

    for child in root:
        last_child = child

        tag = filter_tag(child.tag)

        if tag == 'Body':
            body = child
            return body, FormID, FormName, Version, CreateTime

        elif tag == 'Property':
            if child.attrib['propName'] == 'TemplateID':
                FormID = child.attrib['val']
            elif child.attrib['propName'] == 'OfficialName':
                FormName = child.attrib['val']
            elif child.attrib['propName'] == 'AJCC_Version' or child.attrib['propName'] == 'VersionID':
                Version = child.attrib['val']
            elif child.attrib['propName'] == 'AccreditationDate' or child.attrib['propName'] == 'EffectiveDate':
                try:
                    CreateTime = datetime.strptime(child.attrib['val'].split()[0], '%m/%d/%Y')
                except ValueError:
                    CreateTime = datetime.strptime(child.attrib['val'].split()[0], '%Y-%m-%d')

    if FormID is None:
        body, FormID, FormName, Version, CreateTime = get_metadata(last_child)

    if FormID is None:
        FormID = list(root)[0].attrib['ID']

    return body, FormID, FormName, Version, CreateTime


def xml_to_json(file):
    tree = ET.parse(file)
    root = tree.getroot()

    body, FormID, FormName, Version, CreateTime = get_metadata(root)

    sections = recurse_xml(body)

    form_json = {
        'FormID': FormID,
        'DiagnosticProcedureID': None,
        'FormName': FormName,
        'Version': Version,
        'CreateTime': CreateTime,
        'FormSections': sections
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
        json_content["CreateTime"] = datetime.now()

    return json_content


def does_form_exist(FormID, Version):
    parm_dict = {'FormID': FormID, 'Version': Version}

    # If >1 form exists, then there's already an error
    form = query_form(parm_dict, min_form_lst_len=0, max_form_lst_len=1, remove_id=False, get_latest=False)

    if len(form) == 0:
        return None
    else:
        return form[0]


def validate_form(json):
    for i in ['FormName', 'FormID', 'Version']:
        if i not in json:
            return False
    return True


@APP.route('/forms', methods=['PATCH', 'POST'])
def create_form():
    json_content = get_json_content()

    if not validate_form(json_content):
        abort(406)  # Missing parameters!

    FormID = json_content['FormID']
    Version = json_content['Version']
    form = does_form_exist(FormID, Version)

    if form is not None and request.method == 'POST':  # Form already exists
        abort(409)

    FORM_TABLE.insert_one(json_content)

    if form is not None and request.method == 'PATCH':
        id = form['_id']
        response, response_code = delete_form(id=id)
        if response_code != 201:
            return response, response_code

    form = query_form({'FormID': json_content['FormID']}, max_form_lst_len=1)[0]
    return jsonify(form), 201


def get_response(FormResponseID, remove_id=True, is_draft=None):
    match_form_responses = FORM_RESPONSE_TABLE.find({'FormResponseID': FormResponseID}).sort("CreateTime", -1)
    form_response = process_query(match_form_responses, max_form_lst_len=1, get_latest=False, remove_id=remove_id, is_draft=is_draft)[0]
    return form_response


def query_responses(FormName=None, 
        FormFillerID=None,
        DiagnosticProcedureID=None,
        PatientID=None,
        FormResponseID=None,
        IsDraft=False,
        StartTime=None,
        EndTime=None):
    if IsDraft is True and FormFillerID is None:
        abort(406)  # Need to know which clinician to return drafts for

    parm_query = {}

    parm_query['FormFillerID'] = FormFillerID
    parm_query['PatientID'] = PatientID
    parm_query['FormResponseID'] = FormResponseID
    parm_query['StartTime'] = StartTime
    parm_query['EndTime'] = EndTime
    search_query = get_search_query(parm_query, error_no_params=False)
    match_forms = FORM_RESPONSE_TABLE.find(search_query, 
            {
                'FormResponseID': 1,
                'FormID': 1,
                'PatientID': 1,
                'FormFillerID': 1,
                'IsDraft': 1,
                'Version': 1,
                'CreateTime': {"$dateToString": {"date": "$CreateTime"}}
            }).sort("CreateTime", -1)

    form_response_lst = process_query(match_forms, min_form_lst_len=-1, key='FormResponseID', is_draft=IsDraft)

    # Check if FormID matches FormName

    parm_query = {}
    parm_query['FormName'] = FormName
    parm_query['DiagnosticProcedureID'] = DiagnosticProcedureID
    form_lst = query_form(parm_query, restrict_columns=METADATA_COLUMNS, min_form_lst_len=-1, error_no_params=False, get_latest=False)

    if len(form_lst) == 0:
        return {'items': [], 'total': 0}
    else:
        cross_form_response_lst = []

        for form_response in form_response_lst:
            for form in form_lst:
                if form['FormID'] == form_response['FormID'] and form['Version'] == form_response['Version']:
                    cross_form_response_lst.append({'form': form, 'form-response': form_response})
                    break
        form_response_lst = cross_form_response_lst

    latest_form_response_lst = offset_and_limit(form_response_lst)

    return {'items': latest_form_response_lst, 'total': len(form_response_lst)}


def delete_response(FormResponseID):
    form_response = get_response(FormResponseID, remove_id=False, is_draft=True)
    if 'IsDraft' not in form_response or form_response['IsDraft'] is False:
        abort(405)  # Form response must be a draft to delete

    FORM_RESPONSE_TABLE.delete_one({'_id': ObjectId(form_response['_id'])})
    return jsonify(success=True), 201


def update_form_response(FormResponseID):
    parm_dict = {}

    parm_dict['FormResponseID'] = FormResponseID

    search_query = get_search_query(parm_dict)

    query_response = list(FORM_RESPONSE_TABLE.find(search_query))
    form_response_lst = process_query(query_response, max_form_lst_len=1, get_latest=False, key='FormResponseID', remove_id=False, is_draft=True)

    
    return_json, status = create_form_response()
    if status == 201:
        FORM_RESPONSE_TABLE.delete_one({'_id': ObjectId(form_response_lst[0]['_id'])})
    return  return_json, status

@APP.route('/form-responses/<FormResponseID>', methods=['GET', 'PATCH', 'DELETE'])
def process_response(FormResponseID):
    if request.method == 'GET':
        form_response = get_response(FormResponseID)

        form_id = form_response['FormID']
        version = form_response['Version']

        form = query_form({'FormID': form_id, 'Version': version}, max_form_lst_len=1)[0]

        return jsonify({'form': form, 'form-response': form_response}), 200

    elif request.method == 'PATCH':
        return update_form_response(FormResponseID)

    elif request.method == 'DELETE':
        return delete_response(FormResponseID)

    else:
        abort(405)


@APP.route('/form-responses/search', methods=['GET'])
def search_response():
    FormName = request.args.get('FormName')
    FormFillerID = request.args.get('FormFillerID')
    DiagnosticProcedureID = request.args.get('DiagnosticProcedureID')
    PatientID = request.args.get('PatientID')
    FormResponseID = request.args.get('FormResponseID')
    StartTime = request.args.get('StartTime')
    EndTime = request.args.get('EndTime')
    form_response = query_responses(FormName,
            FormFillerID,
            DiagnosticProcedureID,
            PatientID,
            FormResponseID,
            StartTime=StartTime,
            EndTime=EndTime)

    return jsonify(form_response), 200


@APP.route('/form-responses', methods=['POST'])
def create_form_response():
    # Can only upload JSON
    json = request.json
    validate_form_response(json)

    max_response_id = FORM_RESPONSE_TABLE.find_one(sort=[('FormResponseID', pymongo.DESCENDING)])['FormResponseID']

    FormResponseID = json['FormResponseID'] if 'FormResponseID' in json else str(int(max_response_id) + 1)
    json['FormResponseID'] = FormResponseID
    json['CreateTime'] = datetime.now()
    FORM_RESPONSE_TABLE.insert_one(json)
    return jsonify({"FormResponseID": FormResponseID, "CreateTime": str(json['CreateTime'])}), 201


def validate_form_response(json):
    required_fields = ['FormID', 'PatientID', 'FormFillerID', 'Version', 'Answers']
    for field in required_fields:
        if field not in json:
            abort(406)
        if field != 'FormResponseID' and (json[field] is None or json[field] == ""):
            abort(406)

    parm_dict = {'FormID': json['FormID'], 'Version': json['Version']}
    query_form(parm_dict, min_form_lst_len=1, get_latest=False)


@APP.route('/home/<FormFillerID>', methods=['GET'])
def get_home_data(FormFillerID):
    popular_limit = 4

    form_response = query_responses(FormFillerID=FormFillerID, IsDraft=True)

    all_clinician_forms = query_responses(FormFillerID=FormFillerID)['items']

    popularity_dict = {}

    for tmp in all_clinician_forms:
        form = tmp['form']
        if form['FormID'] not in popularity_dict:
            popularity_dict[form['FormID']] = 1
        else:
            popularity_dict[form['FormID']] += 1

    popularity_lst = sorted(list(popularity_dict.items()), key=lambda x: x[1], reverse=True)

    form_id_by_popularity = [x[0] for x in popularity_lst]
    form_id_by_popularity = form_id_by_popularity[:popular_limit]

    form_meta_by_popularity = []

    for form_id in form_id_by_popularity:
        form_meta_by_popularity.append(query_form({'FormID': form_id}, max_form_lst_len=1, restrict_columns=METADATA_COLUMNS)[0])

    if len(form_meta_by_popularity) < popular_limit:
        extra_forms = query_form({}, restrict_columns=METADATA_COLUMNS, error_no_params=False)
        for form in extra_forms:
            if form not in form_meta_by_popularity:
                form_meta_by_popularity.append(form)
            if len(form_meta_by_popularity) >= popular_limit:
                break

    return jsonify({'drafts': form_response, 'most-used': form_meta_by_popularity})


@APP.route('/clinicians/<ClinicianID>', methods=['GET'])
def get_clinician(ClinicianID):
    clinician = CLINICIAN_TABLE.find_one({'FormFillerID': ClinicianID})
    if clinician is None:
        abort(404)
    else:
        clinician.pop('_id')
        return jsonify(clinician), 200


if __name__ == '__main__':
    APP.run(debug=True)
