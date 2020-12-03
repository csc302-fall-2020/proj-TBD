import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import 'window';
import 'AuthProvider';
import '__mocks__/apps/Form/repository';
import {
    SDCForm,
    SDCFormResponse
} from 'utils/sdcTypes';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';


import FormContainer from 'apps/Form/components/FormContainer';

const form: SDCForm = {
    FormSections: [
        {
            SectionTitle: 'section_1',
            Questions: [
                {
                    QuestionType: 'multipleChoice',
                    QuestionID: '1',
                    options: ['option1', 'option2'],
                    DependentQuestions: [],
                    QuestionString: 'multiple_choice_question',
                    order: 0,
                    enabledState: null
                }
            ]
        }
    ],
    CreateTime: '',
    DiagnosticProcedureID: '1',
    FormID: '1',
    FormName: 'form_name',
    Version: 'form_version_1'
};

const formResponse: SDCFormResponse = {
    Answers: {
        '1': { AnswerType: 'multipleChoice', QuestionID: '1', Answer: ['option1'] }
    },
    FormFillerID: '1',
    CreateTime: '',
    FormID: '1',
    FormResponseID: '1',
    IsDraft: true,
    PatientID: 'patient_id',
    Version: 'form_version_1'
};

test('Renders form', () => {
    render(<FormContainer form={form} />);

    expect(screen.getByTestId('patient-id')).toBeInTheDocument();
    expect(screen.getByText('section_1')).toBeInTheDocument();

    expect(screen.getByText('multiple_choice_question')).toBeInTheDocument();

    expect(screen.getByText('Submit')).toBeInTheDocument();
    expect(screen.getByText('Save to draft')).toBeInTheDocument();
});

test('Renders form with response', () => {
    render(<FormContainer form={form} response={formResponse} />);

    const patientIDInput = screen.getByTestId('patient-id') as HTMLInputElement;
    expect(patientIDInput.value).toBe('patient_id');

    expect(screen.getByLabelText('option1')).toBeChecked();
    expect(screen.getByLabelText('option2')).not.toBeChecked();
});

test('Submits new response as draft', async () => {
    const onSubmit = jest.fn();
    const history = createMemoryHistory();

    render(<Router history={history}>
        <FormContainer form={form} onSubmit={onSubmit} />
    </Router>);

    fireEvent.change(screen.getByTestId('patient-id'), { target: { value: 'patient_id' } });
    fireEvent.click(screen.getByTestId('submit-draft'));
    await waitFor(() => expect(screen.getByTestId('submit-draft')).toBeDisabled());
    expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
            IsDraft: true
        })
    );
    expect(history.location.pathname).toBe('/1/responses/form_response_id');
});

test('Submits new response not as draft', async () => {
    const onSubmit = jest.fn();
    const history = createMemoryHistory();

    render(<Router history={history}>
        <FormContainer form={form} onSubmit={onSubmit} />
    </Router>);

    fireEvent.change(screen.getByTestId('patient-id'), { target: { value: 'patient_id' } });
    fireEvent.click(screen.getByTestId('submit'));

    await waitFor(() => screen.getByTestId('submit-confirm'));

    fireEvent.click(screen.getByTestId('submit-confirm'));

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
            IsDraft: false
        })
    ));
    expect(history.location.pathname).toBe('/1/responses/form_response_id');
});

test('Can\'t submit existing non-draft response', async () => {
    render(<FormContainer form={form} response={{ ...formResponse, IsDraft: false }} />);

    expect(screen.queryByTestId('submit-draft')).not.toBeInTheDocument();
    expect(screen.queryByTestId('submit')).not.toBeInTheDocument();
});