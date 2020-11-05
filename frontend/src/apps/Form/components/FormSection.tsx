import React from 'react';
import { SDCSection } from 'utils/sdcTypes';
import QuestionGroup from './QuestionGroup';

export type FormSectionProps = {
    section: SDCSection;
    disabled?: boolean;
};

const FormSection: React.FC<FormSectionProps> = (props) => {
    const {
        section: { Questions, SectionTitle },
        disabled,
    } = props;

    return (
        <>
            <h2>{SectionTitle}</h2>
            <QuestionGroup questions={Questions} disabled={disabled} />
        </>
    );
};

export default FormSection;
