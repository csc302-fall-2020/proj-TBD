import React from 'react';
import { Form } from 'antd';
import styled from 'styled-components';
import {
    SDC_QUESTION_TYPE_DECIMAL,
    SDC_QUESTION_TYPE_INTEGER,
    SDC_QUESTION_TYPE_MULTIPLE_CHOICE,
    SDC_QUESTION_TYPE_RADIO,
    SDC_QUESTION_TYPE_STRING,
    SDC_QUESTION_TYPE_TRUE_FALSE,
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

const controls: {
    [k in QuestionTypes]: QuestionControl<k>;
} = {
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
    disabled?: boolean;
};

const Question: React.FC<QuestionProps> = (props) => {
    const { question, disabled } = props;

    const control = controls[question.QuestionType];

    let Component: QuestionControlComponent<any>;
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
                {<Component question={question} disabled={disabled} />}
            </Form.Item>
            {question.DependentQuestions.length > 0 && (
                <DependentQuestionsWrapper>
                    <QuestionGroup questions={question.DependentQuestions} disabled={disabled} />
                </DependentQuestionsWrapper>
            )}
        </>
    );
};

export default Question;
