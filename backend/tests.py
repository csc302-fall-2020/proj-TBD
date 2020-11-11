from flask_testing import TestCase
import json

from backend import app


class TestFormEndpoints(TestCase):
    def create_app(self):
        app.FORM_TABLE.delete_many({})
        app.FORM_TABLE.insert_one({'FormName': 'Test1', 'FormID': '-2', 'Version': '1.0'})
        app.FORM_TABLE.insert_one({'FormName': 'Test2', 'FormID': '-2', 'Version': '1.1'})
        app.FORM_TABLE.insert_one({'FormName': 'Test3', 'FormID': '-2', 'Version': '1.13'})
        app.FORM_TABLE.insert_one({'FormName': 'Test4', 'FormID': '-3', 'Version': '1.0'})

        return app.APP

    def test_get_form(self):
        FormID = '-2'

        response = self.client.get("/forms/{FormID}".format(FormID=FormID))
        self.assertEquals(response.status_code, 200)

        self.assertEquals(response.json['FormID'], '-2')

    def test_get_latest_form(self):
        FormID = '-2'

        response = self.client.get("/forms/{FormID}".format(FormID=FormID))
        self.assertEquals(response.status_code, 200)

        self.assertEquals(response.json['Version'], '1.13')

    def test_get_form_missing_id(self):
        FormID = '-1'

        response = self.client.get("/forms/{FormID}".format(FormID=FormID))
        self.assertEquals(response.status_code, 404)

    def test_search_form_name(self):
        FormName = 'Test2'

        response = self.client.get("/forms/search?FormName={FormName}".format(FormName=FormName))
        self.assertEquals(response.status_code, 200)

        self.assertEquals(response.json[0]['FormID'], '-2')
        self.assertEquals(response.json[0]['Version'], '1.1')

    def test_regex_search_form_name(self):
        FormName = 'Test'

        response = self.client.get("/forms/search?FormName={FormName}".format(FormName=FormName))
        self.assertEquals(response.status_code, 200)

        self.assertEquals(len(response.json), 2)

    def test_search_form_missing(self):
        FormName = 'missing'

        response = self.client.get("/forms/search?FormName={FormName}".format(FormName=FormName))
        self.assertEquals(response.status_code, 200)

        self.assertEquals(len(response.json), 0)

    def test_update_form_name(self):
        FormName = 'Test2'
        newFormName = 'Test2.1'

        response = self.client.get("/forms/search?FormName={FormName}".format(FormName=FormName))

        self.assertEquals(response.json[0]['Version'], '1.1')

        # Update form name
        response = self.client.patch("/forms", data=json.dumps({'FormName': newFormName, 'FormID': '-2', 'Version': '1.1'}), content_type='application/json')
        self.assertEquals(response.status_code, 201)

        response = self.client.get("/forms/search?FormName={FormName}".format(FormName=newFormName))

        self.assertEquals(response.json[0]['Version'], '1.1')

        # Revert form name
        response = self.client.patch("/forms", data=json.dumps({'FormName': FormName, 'FormID': '-2', 'Version': '1.1'}), content_type='application/json')
        self.assertEquals(response.status_code, 201)

    def test_delete_form(self):
        FormID = -3
        Version = 1.0

        response = self.client.delete("/forms/{FormID}?Version={Version}".format(FormID=FormID, Version=Version))
        self.assertEquals(response.status_code, 201)

        response = self.client.get("/forms/{FormID}".format(FormID=FormID))
        self.assertEquals(response.status_code, 404)

        response = self.client.post("/forms", data=json.dumps({'FormName': 'Test3', 'FormID': "{FormID}".format(FormID=FormID), 'Version': "{Version}".format(Version=Version)}), content_type='application/json')
        self.assertEquals(response.status_code, 201)

    def test_delete_form_missing_version(self):
        FormID = '-2'

        response = self.client.delete("/forms/{FormID}".format(FormID=FormID))
        self.assertEquals(response.status_code, 406)

    def test_create_form(self):
        FormID = '-4'
        Version = '1.0'

        response = self.client.get("/forms/{FormID}".format(FormID=FormID))
        self.assertEquals(response.status_code, 404)

        response = self.client.post("/forms", data=json.dumps({'FormName': 'Temp4', 'FormID': "{FormID}".format(FormID=FormID), 'Version': "{Version}".format(Version=Version)}), content_type='application/json')
        self.assertEquals(response.status_code, 201)

        response = self.client.get("/forms/{FormID}".format(FormID=FormID))
        self.assertEquals(response.status_code, 200)

        response = self.client.delete("/forms/{FormID}?Version={Version}".format(FormID=FormID, Version=Version))
        self.assertEquals(response.status_code, 201)


class TestResponseFormEndpoints(TestCase):
    def create_app(self):
        app.FORM_RESPONSE_TABLE.delete_many({})
        app.FORM_RESPONSE_TABLE.insert_one({'FormResponseID': '-2', 'FormID': '-3', 'Version': '1.0', 'DiagnosticProcedureID': '-4', 'PatientID': '-5', 'FormFillerID': '-6', 'Answers': {}})
        app.FORM_RESPONSE_TABLE.insert_one({'FormResponseID': '-3', 'FormID': '-3', 'Version': '2.0', 'DiagnosticProcedureID': '-4', 'PatientID': '-5', 'FormFillerID': '-6', 'Answers': {}})
        app.FORM_RESPONSE_TABLE.insert_one({'FormResponseID': '-4', 'FormID': '-4', 'Version': '1.0', 'DiagnosticProcedureID': '-5', 'PatientID': '-6', 'FormFillerID': '-7', 'Answers': {}})

        return app.APP

    def test_get_form_response(self):
        FormResponseID = '-2'

        response = self.client.get("/form-responses/{FormResponseID}".format(FormResponseID=FormResponseID))
        self.assertEquals(response.status_code, 200)

        self.assertEquals(response.json['form']['FormID'], '-3')
        self.assertEquals(response.json['form']['Version'], '1.0')
        self.assertEquals(response.json['form-response']['FormID'], '-3')
        self.assertEquals(response.json['form-response']['Version'], '1.0')
        self.assertEquals(response.json['form-response']['PatientID'], '-5')
        self.assertEquals(response.json['form-response']['FormResponseID'], '-2')

    def test_get_form_response_missing_id(self):
        response = self.client.get("/form-responses/-1")
        self.assertEquals(response.status_code, 404)

    def test_get_search_latest(self):
        FormName = 'Test'
        response = self.client.get("/form-responses/search?FormName={FormName}".format(FormName=FormName))
        self.assertEquals(response.status_code, 200)

        self.assertEquals(response.json[1]['FormID'], '-3')
        self.assertEquals(response.json[1]['Version'], '2.0')
        self.assertEquals(response.json[1]['FormResponseID'], '-3')
        self.assertEquals(len(response.json), 2)

    def test_get_search_misc(self):
        FormID = '-3'
        FormResponseID = '-3'
        DiagnosticProcedureID = '-4'

        response = self.client.get("/form-responses/search?FormResponseID={FormResponseID}&DiagnosticProcedureID={DiagnosticProcedureID}".format(FormID=FormID, FormResponseID=FormResponseID, DiagnosticProcedureID=DiagnosticProcedureID))
        self.assertEquals(response.status_code, 200)

        self.assertEquals(response.json[0]['FormID'], '-3')
        self.assertEquals(response.json[0]['Version'], '2.0')
        self.assertEquals(response.json[0]['FormResponseID'], '-3')
        self.assertEquals(len(response.json), 1)

    def test_get_search_missing(self):
        FormID = '-3'
        FormResponseID = '-6'

        response = self.client.get("/form-responses/search?FormResponseID={FormResponseID}".format(FormID=FormID, FormResponseID=FormResponseID))
        self.assertEquals(response.status_code, 200)

        self.assertEquals(len(response.json), 0)

    def test_update_response_form_name(self):
        FormID = '-2'
        FormResponseID = '-4'
        Version = '1.0'
        newVersion = '2.0'

        response = self.client.get("/form-responses/search?FormResponseID={FormResponseID}".format(FormID=FormID, FormResponseID=FormResponseID))

        self.assertEquals(response.json[0]['Version'], Version)

        # Update form name
        response = self.client.patch("/form-responses/{FormResponseID}".format(FormResponseID=FormResponseID), data=json.dumps({'FormResponseID': FormResponseID, 'FormID': FormID, 'Version': newVersion, 'DiagnosticProcedureID': '-5', 'PatientID': '-6', 'FormFillerID': '-7', 'Answers': {}}), content_type='application/json')
        self.assertEquals(response.status_code, 201)

        response = self.client.get("/form-responses/search?FormResponseID={FormResponseID}".format(FormID=FormID, FormResponseID=FormResponseID))

        self.assertEquals(response.json[0]['Version'], newVersion)

        # Revert form name
        response = self.client.patch("/form-responses/{FormResponseID}".format(FormResponseID=FormResponseID), data=json.dumps({'FormResponseID': FormResponseID, 'FormID': FormID, 'Version': Version, 'DiagnosticProcedureID': '-5', 'PatientID': '-6', 'FormFillerID': '-7', 'Answers': {}}), content_type='application/json')
        self.assertEquals(response.status_code, 201)

    def test_delete_response_form(self):
        FormResponseID = '-2'

        response = self.client.delete("/form-responses/{FormResponseID}".format(FormResponseID=FormResponseID))
        self.assertEquals(response.status_code, 201)

        response = self.client.get("/form-responses/{FormResponseID}".format(FormResponseID=FormResponseID))
        self.assertEquals(response.status_code, 404)

        response = self.client.post("/form-responses", data=json.dumps({'FormResponseID': FormResponseID, 'FormID': '-3', 'Version': '1.0', 'DiagnosticProcedureID': '-4', 'PatientID': '-5', 'FormFillerID': '-6', 'Answers': {}}), content_type='application/json')
        self.assertEquals(response.status_code, 201)

    def test_delete_response_form_missing_version(self):
        FormResponseID = '-1'

        response = self.client.delete("/form-responses/{FormResponseID}".format(FormResponseID=FormResponseID))
        self.assertEquals(response.status_code, 404)

    def test_create_response_form(self):
        FormResponseID = '-5'
        Version = '1.0'

        response = self.client.get("/form-responses/{FormResponseID}".format(FormResponseID=FormResponseID))
        self.assertEquals(response.status_code, 404)

        response = self.client.post("/form-responses", data=json.dumps({'FormResponseID': "{FormResponseID}".format(FormResponseID=FormResponseID), 'FormID': '-2', 'Version': "{Version}".format(Version=Version), 'DiagnosticProcedureID': '-4', 'PatientID': '-5', 'FormFillerID': '-6', 'Answers': {}}), content_type='application/json')
        self.assertEquals(response.status_code, 201)

        response = self.client.get("/form-responses/{FormResponseID}".format(FormResponseID=FormResponseID))
        self.assertEquals(response.status_code, 200)

        response = self.client.delete("/form-responses/{FormResponseID}".format(FormResponseID=FormResponseID))
        self.assertEquals(response.status_code, 201)
