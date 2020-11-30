import React from 'react';
import { render, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import 'AuthProvider';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import 'window';

import Home from 'apps/Home/components/Home';

import { HomePageResponse } from 'utils/sdcTypes';

jest.mock('apps/Home/repository', () => ({
    getHomeData: async (clinicianID: string): Promise<HomePageResponse> => ({
        drafts: {
            items: [
                {
                    form: {
                        FormID: '1',
                        FormName: 'Draft Form Name',
                        DiagnosticProcedureID: '1',
                        Version: '1',
                        CreateTime: '2020-01-01T00:00:00Z'
                    },
                    'form-response': {
                        FormResponseID: '1',
                        FormFillerID: '1',
                        FormID: '1',
                        IsDraft: false,
                        PatientID: '1',
                        Version: '1',
                        CreateTime: '2020-01-01T00:00:00Z'
                    }
                }
            ],
            total: 1
        },
        'most-used': [
            {
                FormID: '1',
                FormName: 'Form Name',
                DiagnosticProcedureID: '1',
                Version: '1',
                CreateTime: '2020-01-01T00:00:00Z'
            }
        ]
    })
}));

test('Renders Home Page', async () => {
    const history = createMemoryHistory();

    const { getByTestId } = render(
        <Router history={history}>
            <Home />
        </Router>
    );

    await waitFor(() => expect(getByTestId('home-page')).toBeInTheDocument());
});

test('Can view returned forms', async () => {
    const history = createMemoryHistory();

    const { getByTestId } = render(
        <Router history={history}>
            <Home />
        </Router>
    );

    await waitFor(() => expect(getByTestId('form-1')).toBeInTheDocument());
});

test('Unable to use FormCard actions', async () => {
    const history = createMemoryHistory();

    const { getByTestId, queryByTestId } = render(
        <Router history={history}>
            <Home />
        </Router>
    );

    await waitFor(() => expect(getByTestId('form-1')).toBeInTheDocument());
    expect(queryByTestId('form-card-actions')).not.toBeInTheDocument();
});

test('Can view returned drafts', async () => {
    const history = createMemoryHistory();

    const { getByText } = render(
        <Router history={history}>
            <Home />
        </Router>
    );

    await waitFor(() => expect(getByText('Draft Form Name')).toBeInTheDocument());
});
