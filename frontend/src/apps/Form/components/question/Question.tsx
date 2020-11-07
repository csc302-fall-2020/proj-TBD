import React, { useState } from 'react';
import { Form } from 'antd';
import styled from 'styled-components';
import {
    SDC_QUESTION_TYPE_DECIMAL,
    SDC_QUESTION_TYPE_INTEGER,
    SDC_QUESTION_TYPE_MULTIPLE_CHOICE,
    SDC_QUESTION_TYPE_RADIO,
    SDC_QUESTION_TYPE_STRING,
    SDC_QUESTION_TYPE_TRUE_FALSE,
    SDCAnswer,
    SDCAnswerTypes,
    SDCQuestion,
    SDCQuestionTypes,
} from 'utils/sdcTypes';
import { Rule } from 'antd/lib/form';
import QuestionGroup from '../QuestionGroup';
import MultipleChoiceQuestion from './MultipleChoiceQuestion';
import RadioQuestion from './RadioQuestion';
import TrueFalseQuestion from './TrueFalseQuestion';
import StringQuestion from './StringQuestion';
import DecimalQuestion from './DecimalQuestion';
import IntegerQuestion from './IntegerQuestion';

export type QuestionControlProps<T extends SDCQuestion> = {
    question: T;
    value?: SDCAnswerTypes[T['QuestionType']]['Answer'];
    onChange?: (value: SDCAnswerTypes[T['QuestionType']]['Answer'] | null) => void;
    disabled?: boolean;
};

type QuestionControlComponent<T extends QuestionTypes> = React.ComponentType<QuestionControlProps<SDCQuestionTypes[T]>>;

export type QuestionControl<T extends QuestionTypes> =
    | {
          Component: QuestionControlComponent<T>;
          rules?: Rule[];
      }
    | QuestionControlComponent<T>;

type QuestionTypes = SDCQuestion['QuestionType'];

const controls: { [k in QuestionTypes]: QuestionControl<k> } = {
    [SDC_QUESTION_TYPE_MULTIPLE_CHOICE]: MultipleChoiceQuestion,
    [SDC_QUESTION_TYPE_RADIO]: RadioQuestion,
    [SDC_QUESTION_TYPE_TRUE_FALSE]: TrueFalseQuestion,
    [SDC_QUESTION_TYPE_STRING]: StringQuestion,
    [SDC_QUESTION_TYPE_INTEGER]: IntegerQuestion,
    [SDC_QUESTION_TYPE_DECIMAL]: DecimalQuestion,
};

const DependentQuestionsWrapper = styled.div`
    margin-left: 2em;
`;

export type QuestionProps = {
    question: SDCQuestion;
    initialValues?: Record<string, SDCAnswer['Answer']>;
    disabled?: boolean;
};

const Question: React.FC<QuestionProps> = (props) => {
    const { question, disabled, initialValues } = props;
    const [answer, setAnswer] = useState<SDCAnswer['Answer'] | null>(initialValues?.[question.QuestionID] ?? '');

    const control = controls[question.QuestionType] as QuestionControl<typeof question['QuestionType']>;

    let Component: QuestionControlComponent<typeof question['QuestionType']>;
    let rules: Rule[] | undefined;
    if (typeof control === 'object') {
        Component = control.Component;
        rules = control.rules;
    } else {
        Component = control;
    }

    return (
        <>
            <Form.Item name={question.QuestionID} label={question.QuestionString} rules={rules}>
                {<Component question={question} disabled={disabled} onChange={(a) => setAnswer(a)} />}
            </Form.Item>
            {question.DependentQuestions.length > 0 && (
                <DependentQuestionsWrapper>
                    <QuestionGroup
                        questions={question.DependentQuestions}
                        initialValues={initialValues}
                        parentAnswer={answer}
                        disabled={disabled || answer === ''}
                    />
                </DependentQuestionsWrapper>
            )}
        </>
    );
};

export default Question;
