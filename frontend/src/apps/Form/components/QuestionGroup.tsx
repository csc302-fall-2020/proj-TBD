import React from 'react';
import styled from 'styled-components';
import { isNull, isUndefined, isEqual } from 'lodash';

import Question from './question/Question';

import { SDCQuestion, SDCAnswer } from 'utils/sdcTypes';

export type QuestionGroupProps = {
    questions: SDCQuestion[];
    initialValues?: Record<string, SDCAnswer['Answer']>;
    parentAnswer?: SDCAnswer['Answer'] | null;
    disabled?: boolean;
};

const QuestionsWrapper = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: stretch;
`;

const QuestionGroup: React.FC<QuestionGroupProps> = (props) => {
    const { questions, initialValues, parentAnswer, disabled } = props;
    return (
        <QuestionsWrapper>
            {questions.map((q) => {
                if (
                    // antd checkbox component doesn't return values in order. This ensures equality if array.
                    !isNull(parentAnswer) &&
                    !isNull(q.enabledState) &&
                    Array.isArray(parentAnswer) &&
                    Array.isArray(q.enabledState)
                ) {
                    parentAnswer.sort();
                    q.enabledState.sort();
                }
                return (
                    (isUndefined(parentAnswer) || isNull(q.enabledState) || isEqual(parentAnswer, q.enabledState)) && (
                        <Question key={q.QuestionID} initialValues={initialValues} question={q} disabled={disabled} />
                    )
                );
            })}
        </QuestionsWrapper>
    );
};

export default QuestionGroup;
