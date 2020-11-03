import React from 'react';
import { render } from '@testing-library/react';
import '@testing-library/jest-dom';
import 'react-router-dom';

import NavBar from 'common/NavBar';

jest.mock('react-router-dom', () => ({
    useParams: () => ({
        clinicianID: '1'
    }),
    useHistory: () => ({
        push: jest.fn()
    })
}));

const tabs = [
    { tabName: 'Home', route: '/home' },
    { tabName: 'Forms', route: '/forms' },
    { tabName: 'Search', route: '/search' }
];

test('Renders NavBar', () => {
    const { getByTestId } = render(
        <NavBar indexSelected={0} tabs={tabs}>
            <div data-testid="content">Content</div>
        </NavBar>
    );

    expect(getByTestId('nav-bar')).toBeInTheDocument();
    tabs.forEach(tab => {
        expect(getByTestId(tab.tabName)).toBeInTheDocument();
    })
    expect(getByTestId('content')).toBeInTheDocument();
});
