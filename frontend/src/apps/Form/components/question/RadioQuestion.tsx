import React from 'react';
import { QuestionControlProps } from './Question';
import { SDCRadioQuestion } from 'utils/sdcTypes';
import { Radio } from 'antd';

export type RadioQuestionProps = QuestionControlProps<SDCRadioQuestion>;

const RadioQuestion: React.FC<RadioQuestionProps> = (props) => {
    const { question, value, onChange, disabled } = props;

    return (
        <Radio.Group value={value} onChange={(e) => onChange?.(e.target.value)} disabled={disabled}>
            {question.options.map((o, i) => (
                <Radio key={i} value={o}>
                    {o}
                </Radio>
            ))}
        </Radio.Group>
    );
};

export default RadioQuestion;
