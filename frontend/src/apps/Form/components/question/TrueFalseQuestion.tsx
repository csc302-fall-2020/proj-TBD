import React from 'react';
import { QuestionControlProps } from './Question';
import { SDCTrueFalseQuestion } from 'utils/sdcTypes';
import { Radio } from 'antd';

export type TrueFalseQuestionProps = QuestionControlProps<SDCTrueFalseQuestion>;

const TrueFalseQuestion: React.FC<TrueFalseQuestionProps> = (props) => {
    const { onChange, value, disabled } = props;
    return (
        <Radio.Group onChange={(e) => onChange?.(e.target.value)} value={value} disabled={disabled}>
            <Radio value={true}>True</Radio>
            <Radio value={false}>False</Radio>
        </Radio.Group>
    );
};

export default TrueFalseQuestion;
