import React from 'react'
import { render, wait, cleanup, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom/extend-expect'
import 'window';
import ApiTester from '../ApiTester';
import { rest } from 'msw'
import { setupServer } from 'msw/node'

const server = setupServer(
    rest.get('/test', (req, res, ctx) => {
        return res(ctx.text('hello there'))
    })
)

beforeAll(() => server.listen())
afterEach(() => {
    server.resetHandlers();
    cleanup();
})
afterAll(() => server.close())

test('Renders title', async () => {
    const testMessage = 'Route Tester';
    const { getByText } = render(<ApiTester defaultRoute="test" />)

    expect(getByText(testMessage)).toBeInTheDocument();
})

test('displays result on GET call', async () => {
    const returnMsg = 'hello there';
    const route = "test";
    const { getByText } = render(<ApiTester defaultRoute={route} />)

    expect(screen.queryByText(returnMsg)).not.toBeInTheDocument()
    fireEvent.click(getByText("Go"));
    await wait(() => expect(getByText(returnMsg)).toBeInTheDocument());
})