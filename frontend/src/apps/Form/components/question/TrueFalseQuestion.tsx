import React from 'react';
import { QuestionControlProps } from './Question';
import { SDCTrueFalseQuestion } from 'utils/sdcTypes';

export type TrueFalseQuestionProps = QuestionControlProps<SDCTrueFalseQuestion>;

const TrueFalseQuestion: React.FC<TrueFalseQuestionProps> = (props) => {
    return <i>This is a true false question</i>;
};

export default TrueFalseQuestion;
