import React from 'react';
import { SDCMultipleChoiceQuestion } from 'utils/sdcTypes';
import { QuestionControlProps } from './Question';

export type MultipleChoiceQuestionProps = QuestionControlProps<SDCMultipleChoiceQuestion>;

const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = (props) => {
    return <i>This is a multiple choice question</i>;
};

export default MultipleChoiceQuestion;
