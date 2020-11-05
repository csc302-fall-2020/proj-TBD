import React from 'react';
import { QuestionControlProps } from './Question';
import { SDCDecimalQuestion } from 'utils/sdcTypes';
import { InputNumber } from 'antd';
import { Rule } from 'antd/lib/form';

const decimalQuestionRules: Rule[] = [{ type: 'number', message: 'Must be a decimal number' }];

export type DecimalQuestionProps = QuestionControlProps<SDCDecimalQuestion>;

const DecimalQuestion: React.FC<DecimalQuestionProps> = (props) => {
    const { onChange, value, disabled } = props;
    return <InputNumber onChange={(e) => onChange?.(e as number)} value={value} disabled={disabled} />;
};

export default { Component: DecimalQuestion, rules: decimalQuestionRules };
