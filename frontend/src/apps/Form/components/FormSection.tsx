import React from 'react';
import { SDCSection } from 'utils/sdcTypes';
import QuestionGroup from './QuestionGroup';

export type FormSectionProps = {
    section: SDCSection;
    disabled?: boolean;
};

const FormSection: React.FC<FormSectionProps> = (props) => {
    const {
        section: { Questions },
        disabled,
    } = props;

    return <QuestionGroup questions={Questions} disabled={disabled} />;
};

export default FormSection;
