import React from 'react';
import { SDCAnswer, SDCSection } from 'utils/sdcTypes';
import QuestionGroup from './QuestionGroup';

export type FormSectionProps = {
    section: SDCSection;
    initialValues?: Record<string, SDCAnswer['Answer'] | undefined>;
    disabled?: boolean;
};

const FormSection: React.FC<FormSectionProps> = (props) => {
    const {
        section: { Questions, SectionTitle },
        initialValues,
        disabled,
    } = props;

    return (
        <>
            <h2>{SectionTitle}</h2>
            <QuestionGroup questions={Questions} initialValues={initialValues} disabled={disabled} />
        </>
    );
};

export default FormSection;
