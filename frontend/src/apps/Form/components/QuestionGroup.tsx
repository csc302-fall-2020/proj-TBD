import React from 'react';
import { SDCQuestion } from 'utils/sdcTypes';
import Question from './question/Question';
import styled from 'styled-components';

export type QuestionGroupProps = {
    questions: SDCQuestion[];
    disabled?: boolean;
};

const QuestionsWrapper = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: stretch;
`;

const QuestionGroup: React.FC<QuestionGroupProps> = (props) => {
    const { questions, disabled } = props;

    return (
        <QuestionsWrapper>
            {questions.map((q) => (
                <Question key={q.QuestionID} question={q} disabled={disabled} />
            ))}
        </QuestionsWrapper>
    );
};

export default QuestionGroup;
