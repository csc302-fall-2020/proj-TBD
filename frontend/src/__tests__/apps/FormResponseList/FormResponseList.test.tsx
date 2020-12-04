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
    const placeholder = 'Search Forms';
    const cardName1 = 'Cool Form';
    const cardName2 = 'AA';
    const utils = render(<Router history={history}><FormResponseRepository /></Router>);
    fireEvent.change(utils.getByPlaceholderText(placeholder), { target: { value: 'test' } });
    await waitFor(() => expect(utils.queryByTestId('spinner')).not.toBeInTheDocument());
    fireEvent.click(utils.getAllByRole('button')[0]);
    await waitFor(() => expect(utils.getByText(cardName2)).toBeInTheDocument());
    await waitFor(() => expect(utils.queryByText(cardName1)).not.toBeInTheDocument());
    fireEvent.change(utils.getByPlaceholderText(placeholder), { target: { value: 'Cool' } });
    fireEvent.click(utils.getAllByRole('button')[0]);
    await waitFor(() => expect(utils.getByText(cardName1)).toBeInTheDocument());
    await waitFor(() => expect(utils.queryByText(cardName2)).not.toBeInTheDocument());
});
