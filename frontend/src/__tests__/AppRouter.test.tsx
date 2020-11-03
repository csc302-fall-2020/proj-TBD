import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { createMemoryHistory } from 'history';
import { Router } from 'react-router-dom';

import AppRouter from 'AppRouter';

const tabs = [
    { tabName: 'Home', route: '/home' },
    { tabName: 'Forms', route: '/forms' },
    { tabName: 'Search', route: '/search' }
];

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

test('Renders NavBar', () => {
    const history = createMemoryHistory();
    history.push('/1/home');
    const { getByTestId } = render(
        <Router history={history}>
            <AppRouter />
        </Router>
    );

    expect(getByTestId('nav-bar')).toBeInTheDocument();
    tabs.forEach(tab => {
        expect(getByTestId(tab.tabName)).toBeInTheDocument();
    });
    expect(getByTestId('home-page')).toBeInTheDocument();
});

test('Can navigate to other tabs and render content', () => {
    const history = createMemoryHistory();
    history.push('/1/home');
    const { getByTestId } = render(
        <Router history={history}>
            <AppRouter />
        </Router>
    );

    fireEvent.click(getByTestId('Forms'));
    expect(getByTestId('form-list-page')).toBeInTheDocument();

    fireEvent.click(getByTestId('Search'));
    expect(getByTestId('search-page')).toBeInTheDocument();
});
