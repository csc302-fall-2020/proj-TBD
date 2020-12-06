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
          if( params?.FormName === 'test'){
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

test('Updates search when input changed', async () => {
    const history = createMemoryHistory();

    const { getByTestId, getByPlaceholderText,getByText } = render(<Router history={history}><FormResponseRepository /></Router>);

    // Step 1: Wait for form response page to load
    await waitFor(() => expect(getByTestId('form-response-page')).toBeInTheDocument());

    // Step 2: Click on Form Name search icon
    fireEvent.click(getByTestId('FormName-search-icon'));

    // Step 3: Type in search
    fireEvent.change(getByPlaceholderText('Search FormName'), { target: { value: 'test' } });

    // Step 4: Click Search button
    fireEvent.click(getByTestId('search-button'));

    // Step 5: Check if the correct results are shown
    await waitFor(() => expect(getByText('test')).toBeInTheDocument());

});
