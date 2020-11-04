import React from 'react';
import { Space } from 'antd';
import styled from 'styled-components';
import { SDCSection } from 'utils/sdcTypes';
import Question from './question/Question';

const StyledSpaceFullWidth = styled(Space)`
    width: 100%;
`;

export type FormSectionProps = {
    section: SDCSection;
};

const FormSection: React.FC<FormSectionProps> = (props) => {
    const {
        section: { Questions },
    } = props;

    return (
        <StyledSpaceFullWidth direction={'vertical'}>
            {Questions.map((q) => (
                <Question key={q.QuestionID} question={q} />
            ))}
        </StyledSpaceFullWidth>
    );
};

export default FormSection;
