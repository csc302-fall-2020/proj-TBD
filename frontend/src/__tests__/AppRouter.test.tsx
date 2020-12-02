import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';
import AppRouter from 'AppRouter';
import {SDCClinician} from 'utils/sdcTypes';
import 'window';

const tabs = [
    { tabName: 'Home', route: '/home' },
    { tabName: 'Forms', route: '/forms' },
    { tabName: 'Responses', route: '/responses' }
];

jest.mock('common/AuthProvider/repository', () => ({
    getUser: async (clinicianID: string): Promise<SDCClinician> => {
        return ({
        FormFillerID: '1',
        FirstName: 'John',
        LastName: 'Doe'
    })}
}));

test('Renders Login Page', () => {
    const history = createMemoryHistory();
    history.push('/');
    const { getByTestId } = render(
        <Router history={history}>
            <AppRouter />
        </Router>
    );

    expect(getByTestId('login-page')).toBeInTheDocument();
});

test('Renders NavBar', async () => {
    const history = createMemoryHistory();
    history.push('/1/home');
    const { getByTestId } = render(
        <Router history={history}>
            <AppRouter />
        </Router>
    );

    await waitFor(() => expect(getByTestId('nav-bar')).toBeInTheDocument());
    tabs.forEach(tab => {
        expect(getByTestId(tab.tabName)).toBeInTheDocument();
    });
    expect(history.location.pathname).toBe('/1/home');
});

test('Can navigate to other tabs and render content', async () => {
    const history = createMemoryHistory();
    history.push('/1/home');
    const { getByTestId } = render(
        <Router history={history}>
            <AppRouter />
        </Router>
    );
    await waitFor(() => expect(getByTestId('Forms')).toBeInTheDocument());
    fireEvent.click(getByTestId('Forms'));
    expect(history.location.pathname).toBe('/1/forms');

    fireEvent.click(getByTestId('Responses'));
    expect(history.location.pathname).toBe('/1/responses');
});
