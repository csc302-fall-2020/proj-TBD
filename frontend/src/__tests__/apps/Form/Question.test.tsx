import React from 'react';
import 'window';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

import Question from 'apps/Form/components/question/Question';
import { Form } from 'antd';
import {
    SDCDecimalQuestion,
    SDCIntegerQuestion,
    SDCMultipleChoiceQuestion,
    SDCRadioQuestion,
    SDCStringQuestion,
    SDCTrueFalseQuestion
} from 'utils/sdcTypes';

const multipleChoiceQuestion: SDCMultipleChoiceQuestion = {
    QuestionType: 'multipleChoice',
    QuestionID: '1',
    options: ['option1', 'option2'],
    DependentQuestions: [],
    QuestionString: 'multiple_choice_question',
    order: 0,
    enabledState: undefined
};

const radioQuestion: SDCRadioQuestion = {
    QuestionType: 'radio',
    QuestionID: '2',
    options: ['option1', 'option2'],
    DependentQuestions: [],
    QuestionString: 'radio_question',
    order: 0,
    enabledState: undefined
};

const stringQuestion: SDCStringQuestion = {
    QuestionType: 'string',
    QuestionID: '3',
    DependentQuestions: [],
    QuestionString: 'string_question',
    order: 0,
    enabledState: undefined
};

const trueFalseQuestion: SDCTrueFalseQuestion = {
    QuestionType: 'trueFalse',
    QuestionID: '4',
    DependentQuestions: [],
    QuestionString: 'true_false_question',
    order: 0,
    enabledState: undefined
};

const integerQuestion: SDCIntegerQuestion = {
    QuestionType: 'integer',
    QuestionID: '5',
    DependentQuestions: [],
    QuestionString: 'integer_question',
    order: 0,
    enabledState: undefined
};

const decimalQuestion: SDCDecimalQuestion = {
    QuestionType: 'decimal',
    QuestionID: '6',
    DependentQuestions: [],
    QuestionString: 'decimal_question',
    order: 0,
    enabledState: undefined
};


test('Renders question text', () => {
    const { getByText } = render(<Form>
        <Question
            question={multipleChoiceQuestion}
            disabled={false}
        />
    </Form>);

    const title = getByText('multiple_choice_question');
    expect(title).toBeInTheDocument();
});

const makeInputTests = (disabled: boolean) => {
    const check = disabled ? 'toBeDisabled' : 'toBeEnabled';
    const checkType = disabled ? 'disabled' : 'enabled';

    return [
        test(`Renders ${checkType} multiple choice inputs`, () => {
            render(<Form>
                <Question
                    question={multipleChoiceQuestion}
                    disabled={disabled}
                />
            </Form>);

            const option1 = screen.getByLabelText('option1');
            const option2 = screen.getByLabelText('option2');

            expect(option1)[check]();
            expect(option2)[check]();
        }),
        test(`Renders ${checkType} radio inputs`, () => {
            render(<Form>
                <Question
                    question={radioQuestion}
                    disabled={disabled}
                />
            </Form>);

            const option1 = screen.getByLabelText('option1');
            const option2 = screen.getByLabelText('option2');

            expect(option1)[check]();
            expect(option2)[check]();
        }),
        test(`Renders ${checkType} trueFalse inputs`, () => {
            render(<Form>
                <Question
                    question={trueFalseQuestion}
                    disabled={disabled}
                />
            </Form>);

            const trueOption = screen.getByLabelText('True');
            const falseOption = screen.getByLabelText('False');

            expect(trueOption)[check]();
            expect(falseOption)[check]();
        }),
        test(`Renders ${checkType} string input`, () => {
            render(<Form>
                <Question question={stringQuestion} disabled={disabled} />
            </Form>);

            expect(screen.getByRole('textbox'))[check]();
        }),
        test(`Renders ${checkType} integer input`, () => {
            render(<Form>
                <Question question={integerQuestion} disabled={disabled} />
            </Form>);

            expect(screen.getByRole('spinbutton'))[check]();
        }),
        test(`Renders ${checkType} decimal input`, () => {
            render(<Form>
                <Question question={decimalQuestion} disabled={disabled} />
            </Form>);

            expect(screen.getByRole('spinbutton'))[check]();
        })
    ];
};

makeInputTests(false);
makeInputTests(true);

test('Renders dependent question', () => {
    const initialValues = { '1': ['option1'] };
    render(<Form initialValues={initialValues}>
        <Question
            question={{
                ...multipleChoiceQuestion,
                DependentQuestions: [
                    {
                        ...radioQuestion,
                        enabledState: ['option1']
                    }
                ]
            }}
            initialValues={initialValues}
        />
    </Form>);

    const option1 = screen.getByText('radio_question');

    expect(option1).toBeInTheDocument();
});

test('Doesn\'t render dependent question', () => {
    const initialValues = { '1': ['option2'] };
    render(<Form initialValues={initialValues}>
        <Question
            question={{
                ...multipleChoiceQuestion,
                DependentQuestions: [
                    {
                        ...radioQuestion,
                        enabledState: ['option1']
                    }
                ]
            }}
            initialValues={initialValues}
        />
    </Form>);

    const option1 = screen.queryByText('radio_question');

    expect(option1).not.toBeInTheDocument();
});