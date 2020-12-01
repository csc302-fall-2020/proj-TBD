import React from 'react';
import '@testing-library/jest-dom';
import { render, waitFor, screen } from '@testing-library/react';
import 'window';
import 'AuthProvider';
import '__mocks__/apps/FormResponse/repository';

import FormResponse from 'apps/FormResponse/components/FormResponse';

test('Fetches and renders draft form response', async () => {
    const onReceiveResponse = jest.fn();

    render(<FormResponse responseID={'response_draft'} onReceiveResponse={onReceiveResponse} />);

    await waitFor(() => {
        expect(screen.getByText('form_name')).toBeInTheDocument();
        expect(onReceiveResponse).toBeCalledWith(
            expect.objectContaining({
                form: expect.objectContaining({
                    FormID: 'form_id'
                }),
                response: expect.objectContaining({
                    FormResponseID: 'response_draft'
                })
            })
        );
    });
});

test('Renders error on invalid form', async () => {
    const onReceiveResponse = jest.fn();

    render(<FormResponse responseID={'does_not_exist'} onReceiveResponse={onReceiveResponse} />);

    await waitFor(() => {
        expect(screen.getByText('form_not_found_error')).toBeInTheDocument();
        expect(onReceiveResponse).not.toHaveBeenCalled();
    });
});