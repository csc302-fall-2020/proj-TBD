import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useParams } from 'react-router-dom';
import { Alert, Col, Row, Space, Spin, Typography } from 'antd';
import { SDCForm } from 'utils/sdcTypes';

import FormRepository from '../repository';
import FormSection from './FormSection';

const { Title, Text } = Typography;

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
            <>
                <Row>
                    <Col>
                        <Space direction={'horizontal'} size={'large'}>
                            <Title>{form.FormName}</Title>
                            <Text>Procedure {form.DiagnosticProcedureID}</Text>
                        </Space>
                    </Col>
                </Row>
                <Row>
                    <Col flex={'auto'}>
                        {form.FormSections.map((s, i) => (
                            <FormSection key={i} section={s} />
                        ))}
                    </Col>
                </Row>
            </>
        );
    }

    return (
        <LoadingWrapper>
            <Spin />
        </LoadingWrapper>
    );
};

export default Form;
