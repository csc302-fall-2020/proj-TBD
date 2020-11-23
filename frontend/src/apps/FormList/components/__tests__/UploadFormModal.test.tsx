import React from 'react';
import { render, waitFor, cleanup, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import 'window';
import UploadFormModal from '../UploadFormModal';

test('Renders title for new/updating form', async () => {
    const uploadMessage = 'Upload Form';
    const uploadModal = render(<UploadFormModal open={true} onClose={() => null} isNewForm={true} onComplete={async () => {}} />);

    expect(uploadModal.getByText(uploadMessage)).toBeInTheDocument();

    const updateMessage = 'Update Form';
    const updateModal = render(<UploadFormModal open={true} onClose={() => null} isNewForm={false} onComplete={async () => {}} />);

    expect(updateModal.getByText(updateMessage)).toBeInTheDocument();
});
