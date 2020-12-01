import React from 'react';
import { render, waitFor, cleanup, waitForElementToBeRemoved, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import 'window';
import 'AuthProvider';
import FormList from '../FormList';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { SDCFormListResponse, FormName } from 'utils/sdcTypes';

jest.mock('apps/FormList/repository', () => ({
    searchMetaDataList: async (FormName: FormName, offset: number): Promise<SDCFormListResponse> => {
        if (FormName === '.*') {
            return ({
                "items": [
                    {
                        "CreateTime": "2020-11-23T23:27:03.169Z",
                        "DiagnosticProcedureID": "1",
                        "FormID": "129.100004300",
                        "FormName": "AD",
                        "Version": "8th Edition"
                    },
                    {
                        "CreateTime": "2020-11-23T02:50:38.765Z",
                        "DiagnosticProcedureID": "1",
                        "FormID": "1",
                        "FormName": "test",
                        "Version": "1.0"
                    },
                    {
                        "CreateTime": "2020-11-23T02:50:38.765Z",
                        "DiagnosticProcedureID": "514213",
                        "FormID": "2",
                        "FormName": "My Medical Form",
                        "Version": "1"
                    }
                ],
                "total": 3
            });
        } else if (FormName === 'test') {
            return ({
                "items": [
                    {
                        "CreateTime": "2020-11-23T23:27:03.169Z",
                        "DiagnosticProcedureID": "2",
                        "FormID": "129.100004300",
                        "FormName": "AA",
                        "Version": "8th Edition"
                    },
                ],
                "total": 3
            });
        } else if (FormName === 'Cool') {
            return ({"items":[{
                "CreateTime": "2020-11-23T02:50:38.765Z",
                "DiagnosticProcedureID": "3",
                "FormID": "1",
                "FormName": "Cool Form",
                "Version": "1.0"
            },],"total":1});
        }
        return ({"items":[],"total":0});
}}));

test('Searches and renders forms', async () => {
    const history = createMemoryHistory();
    const placeholder = 'Search Forms';
    const cardName = 'AD';
    const cardName2 = 'My Medical Form';
    const utils = render(<Router history={history}><FormList /></Router>);
    const input = utils.getByPlaceholderText(placeholder);
    await waitFor(() => expect(utils.getByText(cardName)).toBeInTheDocument());
    await waitFor(() => expect(utils.getByText(cardName2)).toBeInTheDocument());
});

test('Shows empty list when search returns empty', async () => {
    const history = createMemoryHistory();
    const placeholder = 'Search Forms';
    const utils = render(<Router history={history}><FormList /></Router>);
    const input = utils.getByPlaceholderText(placeholder);
    expect(input).toBeInTheDocument();
    fireEvent.change(input, { target: { value: 'hello' } });
    await waitFor(() => expect(utils.queryByTestId('spinner')).not.toBeInTheDocument());
    fireEvent.click(utils.getAllByRole('button')[0]);
    await waitFor(() => expect(utils.getByTestId('form-list')).toBeEmptyDOMElement());
});

test('Updates search when input changed', async () => {
    const history = createMemoryHistory();
    const placeholder = 'Search Forms';
    const cardName1 = 'Cool Form';
    const cardName2 = 'AA';
    const utils = render(<Router history={history}><FormList /></Router>);
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


