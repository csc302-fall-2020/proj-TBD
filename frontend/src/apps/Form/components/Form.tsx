import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { Alert, Spin } from 'antd';
import { SDCForm } from 'utils/sdcTypes';

import formRepository from '../repository';
import FormContainer from './FormContainer';

const LoadingWrapper = styled(Spin)`
    display: 'flex';
    justify-content: 'center';
    margin: 1em;
`;

type FormProps = {};
type Params = { clinicianID: string; formID: string };

const Form: React.FC<FormProps> = () => {
    const { formID } = useParams<Params>();

    const [form, setForm] = useState<SDCForm | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchForm = async (formId: string) => {
            setError(null);
            setForm(null);

            try {
                const form = await formRepository.getForm(formId);

                setForm(form);
            } catch (e) {
                setError(e.message);
            }
        };

        fetchForm(formID);
    }, [formID]);

    if (error) {
        return <Alert message={error} type={'error'} showIcon />;
    }

    if (form) {
        return (
            <FormContainer
                form={form}
                onSubmit={(form) => ({
                    /* TODO: Implement form submission */
                })}
            />
        );
    }

    return (
        <LoadingWrapper>
            <Spin />
        </LoadingWrapper>
    );
};

export default Form;
