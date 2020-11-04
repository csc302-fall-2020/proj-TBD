import React from 'react';
import { QuestionControlProps } from './Question';
import { SDCRadioQuestion } from 'utils/sdcTypes';

export type RadioQuestionProps = QuestionControlProps<SDCRadioQuestion>;

const RadioQuestion: React.FC<RadioQuestionProps> = (props) => {
    return <i>This is a radio question</i>;
};

export default RadioQuestion;
