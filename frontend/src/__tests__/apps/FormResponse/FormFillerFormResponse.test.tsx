import React from 'react';
import '@testing-library/jest-dom';
import 'window';
import 'AuthProvider';
import '__mocks__/apps/FormResponse/repository';
import { render, waitFor, screen, act, fireEvent, waitForElementToBeRemoved } from '@testing-library/react';
import { Route, Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

import FormFillerFormResponse from 'apps/FormResponse/components/FormFillerFormResponse';
import formResponseRepository from 'apps/FormResponse/repository';

const setup = (responseId: string) => {
    const history = createMemoryHistory({
        initialEntries: [`/clinician_id/responses/${responseId}`]
    });

    render(<Router history={history}>
        <Route path={'/:clinicianID/responses/:responseID'}>
            <FormFillerFormResponse />
        </Route>
    </Router>);

    return { history };
};

test('Renders tool buttons for draft response', async () => {
    setup('response_draft');

    await waitFor(() => {
        expect(screen.getByTestId('delete-draft')).toBeInTheDocument();
        expect(screen.getByTestId('make-revision')).toBeInTheDocument();
        expect(screen.getByTestId('new-form')).toBeInTheDocument();
        expect(screen.getByTestId('share-response')).toBeInTheDocument();
    });
});

test('Renders tool buttons for non-draft response', async () => {
    setup('response');

    await waitFor(() => {
        expect(screen.queryByTestId('delete-draft')).not.toBeInTheDocument();
        expect(screen.queryByTestId('make-revision')).not.toBeInTheDocument();
        expect(screen.getByTestId('new-form')).toBeInTheDocument();
        expect(screen.getByTestId('share-response')).toBeInTheDocument();
    });
});

test('Can delete draft response and redirect', async () => {
    const { history } = setup('response_draft');
    const repositorySpy = jest.spyOn(formResponseRepository, 'deleteDraftResponse');

    await waitFor(() => screen.getByTestId('delete-draft'));
    fireEvent.click(screen.getByTestId('delete-draft'));
    await waitFor(() => screen.getByTestId('confirm-delete'));
    fireEvent.click(screen.getByTestId('confirm-delete'));
    await waitForElementToBeRemoved(() => screen.getByTestId('confirm-delete'));

    expect(repositorySpy).toHaveBeenCalledWith('response_draft');
    expect(history.location.pathname).toBe('/clinician_id/responses');
});

test('Can edit draft response', async () => {
    setup('response_draft');

    await waitFor(() => screen.getByTestId('make-revision'));
    fireEvent.click(screen.getByTestId('make-revision'));
    await waitFor(() => expect(screen.getByTestId('submit')).toBeInTheDocument());
});