import React from 'react';
import { Form } from 'antd';
import styled from 'styled-components';
import {
    SDC_QUESTION_TYPE_MULTIPLE_CHOICE,
    SDC_QUESTION_TYPE_RADIO,
    SDC_QUESTION_TYPE_STRING,
    SDC_QUESTION_TYPE_TRUE_FALSE,
    SDCAnswerTypes,
    SDCQuestion,
    SDCQuestionTypes,
} from 'utils/sdcTypes';
import MultipleChoiceQuestion from './MultipleChoiceQuestion';
import RadioQuestion from './RadioQuestion';
import TrueFalseQuestion from './TrueFalseQuestion';
import StringQuestion from './StringQuestion';
import QuestionGroup from '../QuestionGroup';

const DependentQuestionsWrapper = styled.div`
    margin-left: 2em;
`;

export type QuestionControlProps<T extends SDCQuestion> = {
    question: T;
    value?: SDCAnswerTypes[T['QuestionType']]['Answer'];
    onChange?: (value: SDCAnswerTypes[T['QuestionType']]['Answer']) => void;
    disabled?: boolean;
};

type QuestionTypes = SDCQuestion['QuestionType'];

const components: {
    [k in QuestionTypes]: React.ComponentType<QuestionControlProps<SDCQuestionTypes[k]>>;
} = {
    [SDC_QUESTION_TYPE_MULTIPLE_CHOICE]: MultipleChoiceQuestion,
    [SDC_QUESTION_TYPE_RADIO]: RadioQuestion,
    [SDC_QUESTION_TYPE_TRUE_FALSE]: TrueFalseQuestion,
    [SDC_QUESTION_TYPE_STRING]: StringQuestion,
};

export type QuestionProps = {
    question: SDCQuestion;
    disabled?: boolean;
};

const Question: React.FC<QuestionProps> = (props) => {
    const { question, disabled } = props;

    const Component: React.ComponentType<QuestionControlProps<any>> = components[question.QuestionType];

    return (
        <>
            <Form.Item name={question.QuestionID} label={question.QuestionString}>
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
