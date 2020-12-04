import React from 'react';
import { render, waitFor, cleanup, waitForElementToBeRemoved, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import 'window';
import 'AuthProvider';
import  FormResponseList from 'apps/FormResponseList';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { SDCFormResponseParams, SDCFormResponseListResponse } from 'utils/sdcTypes';
import FormResponseRepository from 'apps/FormResponseList';

jest.mock('apps/FormResponseList/repository', () => ({
    getFormResponses: async(params?:SDCFormResponseParams): Promise<SDCFormResponseListResponse> => {
          if( params.FormName = 'test'){
           return({
            items: [
                {
                form: {
                    FormID: '1',
                    FormName: 'test',
                    DiagnosticProcedureID: '1',
                    Version: '1.0',
                    CreateTime: '2020-01-01T00:00:00Z'
                },
                'form-response': {
                    FormResponseID: '1',
                    FormFillerID: '1',
                    FormID: '1',
                    IsDraft: false,
                    PatientID: '1',
                    Version: '1.0',
                    CreateTime: '2020-01-01T00:00:00Z'
                }
            }
        ],
        total: 1
           })
       }

       return ({
        items: [{
         form: {
             FormID: '1',
             FormName: 'Response Form name',
             DiagnosticProcedureID: '1',
             Version: '1.0',
             CreateTime: '2020-01-01T00:00:00Z'
         },
         'form-response': {
             FormResponseID: '1',
             FormFillerID: '1',
             FormID: '1',
             IsDraft: false,
             PatientID: '1',
             Version: '1.0',
             CreateTime: '2020-01-01T00:00:00Z'
             }
         }],
         total: 1
     })
      
    }
}));


test('Can view response list', async () => {
    const history = createMemoryHistory();

    const { getByText } = render(
        <Router history={history}>
            <FormResponseRepository />
        </Router>
    );

    await waitFor(() => expect(getByText('Response Form name')).toBeInTheDocument());
});

test('searches and render the table', async () => {
    const history = createMemoryHistory();

    const { getByText } = render(
        <Router history={history}>
            <FormResponseRepository />
        </Router>
    );

    await waitFor(() => expect(getByText('Response Form name')).toBeInTheDocument());
});

