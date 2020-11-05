import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { Alert, Spin } from 'antd';
import { SDCForm } from 'utils/sdcTypes';

import FormRepository from '../repository';
import FormContainer from './FormContainer';

const LoadingWrapper = styled(Spin)`
    display: 'flex';
    justify-content: 'center';
    margin: 1em;
`;

type FormProps = {};
type Params = { clinicianId: string; formID: string };

const Form: React.FC<FormProps> = () => {
    const { formID } = useParams<Params>();

    const [repository] = useState(new FormRepository());
    const [form, setForm] = useState<SDCForm | undefined>(undefined);
    const [error, setError] = useState<string | undefined>();

    useEffect(() => {
        const fetchForm = async (formId: string) => {
            setError(undefined);
            setForm(undefined);

            try {
                const form = await repository.getForm(formId);

                setForm(form);
            } catch (e) {
                setError(e.message);
            }
        };

        fetchForm(formID);
    }, [formID, repository]);

    if (error !== undefined) {
        return <Alert message={error} type={'error'} showIcon />;
    }
    if (form !== undefined) {
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
