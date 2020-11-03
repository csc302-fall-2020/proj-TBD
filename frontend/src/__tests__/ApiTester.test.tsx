import React from 'react';
import { render, waitFor, cleanup, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import 'window';
import ApiTester from '../ApiTester';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

const server = setupServer(
    rest.get('/test', (req, res, ctx) => {
        return res(ctx.text('hello there'));
    })
);

beforeAll(() => server.listen());
afterEach(() => {
    server.resetHandlers();
    cleanup();
});
afterAll(() => server.close());

test('Renders title', async () => {
    const testMessage = 'Route Tester';
    const { getByText } = render(<ApiTester defaultRoute="test" />);

    expect(getByText(testMessage)).toBeInTheDocument();
});

test('displays result on GET call', async () => {
    const returnMsg = 'hello there';
    const route = 'test';
    render(<ApiTester defaultRoute={route} />);

    expect(screen.queryByText(returnMsg)).not.toBeInTheDocument();
    fireEvent.click(screen.getByText('Go'));
    await waitFor(() => screen.getByText(returnMsg));
});
