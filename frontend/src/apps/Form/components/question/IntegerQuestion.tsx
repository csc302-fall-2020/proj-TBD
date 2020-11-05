import React from 'react';
import { QuestionControlProps } from './Question';
import { SDCIntegerQuestion } from 'utils/sdcTypes';
import { InputNumber } from 'antd';
import { Rule } from 'antd/lib/form';

const integerQuestionRules: Rule[] = [
    {
        validator: (_, value, callback) => {
            if (!Number.isInteger(value)) {
                return callback('Must be an integer');
            }
            return callback();
        },
    },
];

export type IntegerQuestionProps = QuestionControlProps<SDCIntegerQuestion>;

const IntegerQuestion: React.FC<IntegerQuestionProps> = (props) => {
    const { onChange, value, disabled } = props;

    return <InputNumber type={'n'} onChange={(e) => onChange?.(e as number)} value={value} disabled={disabled} />;
};

export default { Component: IntegerQuestion, rules: integerQuestionRules };
