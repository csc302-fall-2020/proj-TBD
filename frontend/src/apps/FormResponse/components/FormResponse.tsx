import React, { useEffect, useState } from 'react';
import { SDCForm, SDCFormResponse } from 'utils/sdcTypes';
import formResponseRepository from 'apps/FormResponse/repository';
import FormContainer from 'apps/Form/components/FormContainer';
import { Alert, Spin, Typography } from 'antd';
import styled from 'styled-components';

const { Title } = Typography;

const SpinnerWrapper = styled.div`
    display: flex;
    justify-content: center;
    margin: 1em;
`;

export type FormResponseProps = {
    responseID: string;
    onReceiveResponse?: (response: FormWithResponse | null) => void;
    enabled?: boolean;
};

export type FormWithResponse = {
    form: SDCForm;
    response: SDCFormResponse;
};

const FormResponse: React.FC<FormResponseProps> = (props) => {
    const { responseID, onReceiveResponse, enabled } = props;

    const [error, setError] = useState<string | null>(null);
    const [response, setResponse] = useState<FormWithResponse | null>(null);

    useEffect(() => {
        const fetchResponse = async (responseID: string) => {
            setResponse(null);
            setError(null);

            try {
                const responseWithForm = await formResponseRepository.getResponse(responseID);

                if (typeof (responseWithForm.form.FormSections) === 'string') {
                    responseWithForm.form.FormSections = JSON.parse(responseWithForm.form.FormSections);
                }

                setResponse(responseWithForm);
                onReceiveResponse?.(responseWithForm);
            } catch (e) {
                setError(e.message);
            }
        };

        fetchResponse(responseID);
    }, [onReceiveResponse, responseID]);

    // If we go from enabled to disabled, we need to reset any changes (to the response) that may have been made
    useEffect(
        () =>
            setResponse((response) =>
                response
                    ? {
                        form: response.form,
                        response: { ...response.response }
                    }
                    : null
            ),
        [enabled]
    );

    if (error) {
        return <Alert showIcon type={'error'} message={error} />;
    }

    if (response) {
        return (
            <>
                {response.response.IsDraft && (
                    <Title level={3} type={'secondary'}>
                        DRAFT
                    </Title>
                )}
                <FormContainer
                    {...response}
                    disabled={!enabled}
                    onSubmit={(newResponse) => {
                        const withForm = {
                            form: response.form,
                            response: newResponse
                        };
                        setResponse(withForm);
                        onReceiveResponse?.(withForm);
                    }}
                />
            </>
        );
    }

    return (
        <SpinnerWrapper>
            <Spin />
        </SpinnerWrapper>
    );
};

export default FormResponse;
