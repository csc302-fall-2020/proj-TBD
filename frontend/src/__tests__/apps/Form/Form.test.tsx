import React from 'react';
import { render, waitFor, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import 'window';
import { Route, Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import Form from 'apps/Form';
import { FormRepository } from 'apps/Form/repository';

jest.mock('apps/Form/repository', () => {
    const repository: Partial<FormRepository> = {
        async getForm(formID) {
            if (formID === '1') {
                return {
                    CreateTime: '2020-01-01T00:00:00Z',
                    FormID: '1',
                    DiagnosticProcedureID: '',
                    FormName: 'form_name',
                    FormSections: [],
                    Version: '1'
                };
            }
            throw new Error('form_not_found_error');
        }
    };

    return repository;
});

test('Fetches and renders form', async () => {
    const history = createMemoryHistory({ initialEntries: ['/clinician_id/forms/1'] });
    render(<Router history={history}>
        <Route path={'/:clinicianID/forms/:formID'}>
            <Form />
        </Route>
    </Router>);

    await waitFor(() => expect(screen.getByText('form_name')).toBeInTheDocument());
});

test('Renders error on invalid form', async () => {
    const history = createMemoryHistory();
    history.push('/clinician_id/forms/2');
    render(<Router history={history}>
        <Form />
    </Router>);

    await waitFor(() => expect(screen.getByText('form_not_found_error')).toBeInTheDocument());
});