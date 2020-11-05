import React from 'react';
import { QuestionControlProps } from './Question';
import { SDCStringQuestion } from 'utils/sdcTypes';
import { Input } from 'antd';
import styled from 'styled-components';

export type StringQuestionProps = QuestionControlProps<SDCStringQuestion>;

const StyledInput = styled(Input)`
    max-width: 250px;
`;

const StringQuestion: React.FC<StringQuestionProps> = (props) => {
    const { onChange, value, disabled } = props;
    return <StyledInput type={'text'} onChange={(e) => onChange?.(e.target.value)} value={value} disabled={disabled} />;
};

export default StringQuestion;
