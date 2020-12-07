from flask_testing import TestCase
import json
from datetime import datetime
import app
import time

class TestFormEndpoints(TestCase):
    def create_app(self):
        app.FORM_TABLE.delete_many({})
        app.FORM_TABLE.insert_one({'FormName': 'Test1', 'FormID': '-2', 'Version': '1.0', 'CreateTime': datetime.now()})
        time.sleep(0.1)
        app.FORM_TABLE.insert_one({'FormName': 'Test2', 'FormID': '-2', 'Version': '1.1', 'DiagnosticProcedureID': '-4', 'CreateTime': datetime.now()})
        time.sleep(0.1)
        app.FORM_TABLE.insert_one({'FormName': 'Test3', 'FormID': '-2', 'Version': '1.13', 'DiagnosticProcedureID': '-4', 'CreateTime': datetime.now()})
        app.FORM_TABLE.insert_one({'FormName': 'Test4', 'FormID': '-3', 'Version': '1.0', 'DiagnosticProcedureID': '-5', 'CreateTime': datetime.now()})

        return app.APP

    def test_get_form(self):
        FormID = '-2'

        response = self.client.get("/forms/{FormID}".format(FormID=FormID))
        self.assertEqual(response.status_code, 200)

        self.assertEqual(response.json['FormID'], '-2')

    def test_get_latest_form(self):
        FormID = '-2'

        response = self.client.get("/forms/{FormID}".format(FormID=FormID))
        self.assertEqual(response.status_code, 200)

        self.assertEqual(response.json['Version'], '1.13')

    def test_get_form_missing_id(self):
        FormID = '-1'

        response = self.client.get("/forms/{FormID}".format(FormID=FormID))
        self.assertEqual(response.status_code, 404)

    def test_search_form_name(self):
        FormName = 'Test2'

        response = self.client.get("/forms/search?FormName={FormName}".format(FormName=FormName))
        self.assertEqual(response.status_code, 200)

        self.assertEqual(response.json['items'][0]['FormID'], '-2')
        self.assertEqual(response.json['items'][0]['Version'], '1.1')

    def test_regex_search_form_name(self):
        FormName = 'Test'

        response = self.client.get("/forms/search?FormName={FormName}".format(FormName=FormName))
        self.assertEqual(response.status_code, 200)

        self.assertEqual(len(response.json), 2)

    def test_search_form_missing(self):
        FormName = 'missing'

        response = self.client.get("/forms/search?FormName={FormName}".format(FormName=FormName))
        self.assertEqual(response.status_code, 200)

        self.assertEqual(response.json['total'], 0)

    def test_update_form_name(self):
        FormName = 'Test2'
        newFormName = 'Test2.1'

        response = self.client.get("/forms/search?FormName={FormName}".format(FormName=FormName))

        self.assertEqual(response.json['items'][0]['Version'], '1.1')

        # Update form name
        response = self.client.patch("/forms", data=json.dumps({'FormName': newFormName, 'FormID': '-2', 'Version': '1.1'}), content_type='application/json')
        self.assertEqual(response.status_code, 201)

        response = self.client.get("/forms/search?FormName={FormName}".format(FormName=newFormName))

        self.assertEqual(response.json['items'][0]['Version'], '1.1')

        # Revert form name
        response = self.client.patch("/forms", data=json.dumps({'FormName': FormName, 'FormID': '-2', 'Version': '1.1'}), content_type='application/json')
        self.assertEqual(response.status_code, 201)

    def test_delete_form(self):
        FormID = -3
        Version = 1.0

        response = self.client.delete("/forms/{FormID}?Version={Version}".format(FormID=FormID, Version=Version))
        self.assertEqual(response.status_code, 201)

        response = self.client.get("/forms/{FormID}".format(FormID=FormID))
        self.assertEqual(response.status_code, 404)

        response = self.client.post("/forms", data=json.dumps({'FormName': 'Test3', 'FormID': "{FormID}".format(FormID=FormID), 'Version': "{Version}".format(Version=Version)}), content_type='application/json')
        self.assertEqual(response.status_code, 201)

    def test_delete_form_missing_version(self):
        FormID = '-2'

        response = self.client.delete("/forms/{FormID}".format(FormID=FormID))
        self.assertEqual(response.status_code, 406)

    def test_create_form(self):
        FormID = '-4'
        Version = '1.0'

        response = self.client.get("/forms/{FormID}".format(FormID=FormID))
        self.assertEqual(response.status_code, 404)

        response = self.client.post("/forms", data=json.dumps({'FormName': 'Temp4', 'FormID': "{FormID}".format(FormID=FormID), 'Version': "{Version}".format(Version=Version)}), content_type='application/json')
        self.assertEqual(response.status_code, 201)

        response = self.client.get("/forms/{FormID}".format(FormID=FormID))
        self.assertEqual(response.status_code, 200)

        response = self.client.delete("/forms/{FormID}?Version={Version}".format(FormID=FormID, Version=Version))
        self.assertEqual(response.status_code, 201)


class TestResponseFormEndpoints(TestCase):
    def create_app(self):
        app.FORM_RESPONSE_TABLE.delete_many({})
        app.FORM_RESPONSE_TABLE.insert_one({'FormResponseID': '-2', 'FormID': '-3', 'Version': '1.0', 'PatientID': '-5', 'FormFillerID': '-6', 'Answers': {}, 'CreateTime': datetime.now()})
        app.FORM_RESPONSE_TABLE.insert_one({'FormResponseID': '-3', 'FormID': '-3', 'Version': '2.0', 'PatientID': '-5', 'FormFillerID': '-6', 'Answers': {}, 'CreateTime': datetime.now()})
        app.FORM_RESPONSE_TABLE.insert_one({'FormResponseID': '-4', 'FormID': '-4', 'Version': '1.0', 'PatientID': '-6', 'FormFillerID': '-7', 'Answers': {}, 'CreateTime': datetime.now()})

        return app.APP

    def test_get_form_response(self):
        FormResponseID = '-2'

        response = self.client.get("/form-responses/{FormResponseID}".format(FormResponseID=FormResponseID))
        self.assertEqual(response.status_code, 200)

        self.assertEqual(response.json['form']['FormID'], '-3')
        self.assertEqual(response.json['form']['Version'], '1.0')
        self.assertEqual(response.json['form-response']['FormID'], '-3')
        self.assertEqual(response.json['form-response']['Version'], '1.0')
        self.assertEqual(response.json['form-response']['PatientID'], '-5')
        self.assertEqual(response.json['form-response']['FormResponseID'], '-2')

    def test_get_form_response_missing_id(self):
        response = self.client.get("/form-responses/-1")
        self.assertEqual(response.status_code, 404)

    def test_get_search_latest(self):
        FormName = 'Test'
        response = self.client.get("/form-responses/search?FormName={FormName}".format(FormName=FormName))
        self.assertEqual(response.status_code, 200)

        # Only 1 result because different form version numbers
        self.assertEqual(response.json['items'][0]['form']['FormID'], '-3')
        self.assertEqual(response.json['items'][0]['form']['Version'], '1.0')
        self.assertEqual(response.json['items'][0]['form-response']['FormResponseID'], '-2')
        self.assertEqual(response.json['total'], 1)

    def test_get_search_misc(self):
        FormResponseID = '-2'

        response = self.client.get("/form-responses/search?FormResponseID={FormResponseID}".format(FormResponseID=FormResponseID))
        self.assertEqual(response.status_code, 200)

        self.assertEqual(response.json['items'][0]['form']['FormID'], '-3')
        self.assertEqual(response.json['items'][0]['form']['Version'], '1.0')
        self.assertEqual(response.json['items'][0]['form-response']['FormResponseID'], '-2')
        self.assertEqual(response.json['total'], 1)

    def test_get_search_missing(self):
        FormID = '-3'
        FormResponseID = '-6'

        response = self.client.get("/form-responses/search?FormResponseID={FormResponseID}".format(FormID=FormID, FormResponseID=FormResponseID))
        self.assertEqual(response.status_code, 200)

        self.assertEqual(len(response.json['items']), 0)

    def test_update_response_form_name(self):
        FormID = '-4'
        FormResponseID = '-4'
        Version = '1.0'
        newVersion = '2.0'

        response = self.client.get("/form-responses/search?FormResponseID={FormResponseID}".format(FormID=FormID, FormResponseID=FormResponseID))
        #print(response.json)
        #self.assertEqual(response.json['items'][0]['Version'], Version)

        # Update form name
        #response = self.client.patch("/form-responses/{FormResponseID}".format(FormResponseID=FormResponseID), data=json.dumps({'FormResponseID': FormResponseID, 'FormID': FormID, 'Version': newVersion, 'DiagnosticProcedureID': '-5', 'PatientID': '-6', 'FormFillerID': '-7', 'Answers': {}}), content_type='application/json')
        #self.assertEqual(response.status_code, 201)

        #response = self.client.get("/form-responses/search?FormResponseID={FormResponseID}".format(FormID=FormID, FormResponseID=FormResponseID))

        #self.assertEqual(response.json['items'][0]['Version'], newVersion)

        # Revert form name
        #response = self.client.patch("/form-responses/{FormResponseID}".format(FormResponseID=FormResponseID), data=json.dumps({'FormResponseID': FormResponseID, 'FormID': FormID, 'Version': Version, 'DiagnosticProcedureID': '-5', 'PatientID': '-6', 'FormFillerID': '-7', 'Answers': {}}), content_type='application/json')
        #self.assertEqual(response.status_code, 201)

    def test_delete_response_form(self):
        FormResponseID = '-2'

        response = self.client.delete("/form-responses/{FormResponseID}".format(FormResponseID=FormResponseID))
        self.assertEqual(response.status_code, 404)  # Could not find a draft

        # Create draft
        response = self.client.post("/form-responses", data=json.dumps({'FormID': '-3', 'Version': '1.0', 'DiagnosticProcedureID': '-4', 'PatientID': '-5', 'FormFillerID': '-6', 'Answers': {}, 'IsDraft': 'true'}), content_type='application/json')
        self.assertEqual(response.status_code, 201)

        draft_response_id = '-1'  # max responseid + 1

        response = self.client.delete("/form-responses/{FormResponseID}".format(FormResponseID=draft_response_id))
        #self.assertEqual(response.status_code, 201)  # Delete response

        response = self.client.get("/form-responses/{FormResponseID}".format(FormResponseID=draft_response_id))
        self.assertEqual(response.status_code, 404)  # Cant find response


    def test_delete_response_form_missing_version(self):
        FormResponseID = '-1'

        response = self.client.delete("/form-responses/{FormResponseID}".format(FormResponseID=FormResponseID))
        self.assertEqual(response.status_code, 404)

    def test_create_response_form(self):
        FormResponseID = '-1'
        Version = '1.0'
        FormID = '-2'
        PatientID = '-5'
        FormFillerID = '-7'

        response = self.client.get("/form-responses/{FormResponseID}".format(FormResponseID=FormResponseID))
        self.assertEqual(response.status_code, 404)

        response = self.client.post("/form-responses", data=json.dumps({'FormID': FormID, 'Version': Version, 'DiagnosticProcedureID': '-4', 'PatientID': PatientID, 'FormFillerID': FormFillerID, 'Answers': {}, 'IsDraft': 'true'}), content_type='application/json')
        self.assertEqual(response.status_code, 201)
