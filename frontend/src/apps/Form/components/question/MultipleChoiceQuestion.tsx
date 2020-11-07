import { Checkbox, Row, Col } from 'antd';
import React, { useEffect } from 'react';
import { SDCMultipleChoiceQuestion } from 'utils/sdcTypes';
import { QuestionControlProps } from './Question';
import styled from 'styled-components';

export type MultipleChoiceQuestionProps = QuestionControlProps<SDCMultipleChoiceQuestion>;

const StyledCheckboxGroup = styled(Checkbox.Group)`
    width: 100%;
`;

const MultipleChoiceQuestion: React.FC<MultipleChoiceQuestionProps> = (props) => {
    const { question, onChange, value, disabled } = props;

    return (
        <StyledCheckboxGroup onChange={(e) => onChange?.(e.map((v) => `${v}`))} value={value} disabled={disabled}>
            <Row>
                {question.options.map((o, i) => (
                    <Col key={i}>
                        <Checkbox value={o}>{o}</Checkbox>
                    </Col>
                ))}
            </Row>
        </StyledCheckboxGroup>
    );
};

export default MultipleChoiceQuestion;
