import React from 'react';
import styled from 'styled-components';
import { SDCAnswer, SDCSection } from 'utils/sdcTypes';
import QuestionGroup from './QuestionGroup';

export type FormSectionProps = {
    section: SDCSection;
    initialValues?: Record<string, SDCAnswer['Answer']>;
    disabled?: boolean;
};

const StyledDivInset = styled.div`
    margin-left: 2em;
`;

const FormSection: React.FC<FormSectionProps> = (props) => {
    const {
        section: { Questions, SectionTitle, Sections },
        initialValues,
        disabled
    } = props;

    return (
        <>
            <h2>{SectionTitle}</h2>
            <QuestionGroup questions={Questions} initialValues={initialValues} disabled={disabled} />
            {Sections && <StyledDivInset>
                {Sections.map((s, i) => <FormSection
                    key={i}
                    section={s}
                    disabled={disabled}
                    initialValues={initialValues} />)}
            </StyledDivInset>}
        </>
    );
};

export default FormSection;
