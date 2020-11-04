import React from 'react';
import { QuestionControlProps } from './Question';
import { SDCStringQuestion } from 'utils/sdcTypes';
import { Input } from 'antd';

export type StringQuestionProps = QuestionControlProps<SDCStringQuestion>;

const StringQuestion: React.FC<StringQuestionProps> = (props) => {
    return <Input type={'text'} />;
};

export default StringQuestion;
