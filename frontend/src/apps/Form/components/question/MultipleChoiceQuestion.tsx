import { Space, Checkbox } from 'antd';
import React from 'react';
import { SDCMultipleChoiceQuestion } from 'utils/sdcTypes';
import { QuestionControlProps } from './Question';

export type MultipleChoiceQuestionProps = QuestionControlProps<SDCMultipleChoiceQuestion>;

const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = (props) => {
    const { question, onChange, value, disabled } = props;

    return (
        <Checkbox.Group onChange={(e) => onChange?.(e.map((v) => `${v}`))} value={value} disabled={disabled}>
            <Space direction={'horizontal'}>
                {question.options.map((o, i) => (
                    <Checkbox key={i} value={o}>
                        {o}
                    </Checkbox>
                ))}
            </Space>
        </Checkbox.Group>
    );
};

export default MultipleChoiceQuestion;
