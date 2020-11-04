import React from 'react';
import { Space, Typography } from 'antd';
import {
    SDC_QUESTION_TYPE_MULTIPLE_CHOICE,
    SDC_QUESTION_TYPE_RADIO,
    SDC_QUESTION_TYPE_STRING,
    SDC_QUESTION_TYPE_TRUE_FALSE,
    SDCQuestion,
    SDCQuestionTypes,
} from 'utils/sdcTypes';
import MultipleChoiceQuestion from './MultipleChoiceQuestion';
import RadioQuestion from './RadioQuestion';
import TrueFalseQuestion from './TrueFalseQuestion';
import StringQuestion from './StringQuestion';
import styled from 'styled-components';

const { Text } = Typography;

const DependentQuestionsWrapper = styled.div`
    margin-left: 2em;
`;

export type QuestionControlProps<T extends SDCQuestion> = {
    question: T;
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
};

const Question: React.FC<QuestionProps> = (props) => {
    const { question } = props;

    const Component: React.ComponentType<QuestionControlProps<any>> = components[question.QuestionType];

    return (
        <Space size={'small'} direction={'vertical'}>
            <Text>{question.QuestionString}</Text>
            {<Component question={question} />}
            {question.DependentQuestions.length > 0 && (
                <DependentQuestionsWrapper>
                    {question.DependentQuestions.map((q) => (
                        <Question key={q.QuestionID} question={q} />
                    ))}
                </DependentQuestionsWrapper>
            )}
        </Space>
    );
};

export default Question;
