import React, { useEffect, useState } from 'react';
import { SDCForm, SDCFormResponse } from '../../../utils/sdcTypes';
import formResponseRepository from '../repository';
import formRepository from '../../Form/repository';
import FormContainer from 'apps/Form/components/FormContainer';
import { Alert, Spin } from 'antd';
import styled from 'styled-components';

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
                const response = await formResponseRepository.getResponse(responseID);
                const form = await formRepository.getForm(response.FormID);

                setResponse({ form, response });
            } catch (e) {
                setError(e.message);
            }
        };

        fetchResponse(responseID);
    }, [responseID]);

    useEffect(() => onReceiveResponse?.(response), [onReceiveResponse, response]);

    // If we go from enabled to disabled, we need to reset any changes (to the response) that may have been made
    useEffect(
        () =>
            setResponse((response) =>
                response
                    ? {
                          form: response.form,
                          response: { ...response.response },
                      }
                    : null
            ),
        [enabled]
    );

    if (error) {
        return <Alert showIcon type={'error'} message={error} />;
    }

    if (response) {
        return <FormContainer {...response} disabled={!enabled} />;
    }

    return (
        <SpinnerWrapper>
            <Spin />
        </SpinnerWrapper>
    );
};

export default FormResponse;
