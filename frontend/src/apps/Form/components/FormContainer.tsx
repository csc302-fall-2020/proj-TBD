import React, { useEffect } from 'react';
import { Button, Col, Divider, Form as AntForm, Form, Input, Row, Space, Typography } from 'antd';
import { SDCAnswer, SDCForm, SDCFormResponse, SDCQuestion } from 'utils/sdcTypes';
import FormSection from './FormSection';
import styled from 'styled-components';
import { PATIENT_ID_INPUT_NAME } from '../constants';

const { Title, Text } = Typography;

/**
 * Gets all questions including and inside a question
 */
const _getQuestions = (question: SDCQuestion): SDCQuestion[] => {
    return question.DependentQuestions.reduce((prev, curr) => [..._getQuestions(curr)], [question]);
};

/**
 * Gets all questions for a form
 */
const _getFormQuestions = (form: SDCForm): SDCQuestion[] => {
    return form.FormSections.reduce(
        (prev, curr) => [...prev, ...curr.Questions.reduce((a, q) => [...a, ..._getQuestions(q)], [] as SDCQuestion[])],
        [] as SDCQuestion[]
    );
};

/**
 * Given form values from the AntDesign Form (dict. of questionId: answer) construct a form response
 */
const _constructFormResponse = (form: SDCForm, formValues: any, previousResponse?: SDCFormResponse) => {
    const questions = _getFormQuestions(form);

    const answers: { [questionID: string]: SDCAnswer } = {};
    questions.forEach(<T extends SDCQuestion>(q: T) => {
        if (formValues[q.QuestionID] !== undefined) {
            const answer = {
                QuestionID: q.QuestionID,
                Answer: formValues[q.QuestionID],
                AnswerType: q.QuestionType,
            };

            answers[q.QuestionID] = answer;
        }
    });

    const response: SDCFormResponse = {
        FormResponseID: previousResponse?.FormResponseID ?? '',
        PatientID: formValues[PATIENT_ID_INPUT_NAME] as string,
        FormID: form.FormID,
        FormFillerID: '', // TODO: set as current user,
        DiagnosticProcedureID: form.DiagnosticProcedureID,
        Answers: answers,
    };

    return response;
};

const _constructFormFieldData = (response: SDCFormResponse) => {
    return [
        ...Object.keys(response.Answers).map((questionId) => ({
            name: questionId,
            value: response.Answers[questionId].Answer,
        })),
        { name: PATIENT_ID_INPUT_NAME, value: response.PatientID },
    ];
};

const StyledForm = styled(AntForm)`
    .ant-form-item {
        margin-bottom: 18px;
    }

    .ant-form-item-label {
        font-weight: 500;
    }
`;

export type FormContainerProps = {
    form: SDCForm;
    response?: SDCFormResponse;
    onSubmit?: (response: SDCFormResponse) => void;
    disabled?: boolean;
};

const FormContainer: React.FC<FormContainerProps> = (props) => {
    const { form: sdcForm, response: sdcResponse, onSubmit, disabled } = props;

    const [form] = Form.useForm();

    useEffect(() => {
        if (sdcResponse !== undefined) {
            // Populate the form with existing response data
            form.setFields(_constructFormFieldData(sdcResponse));
        }
    }, [sdcResponse]);

    return (
        <StyledForm
            form={form}
            scrollToFirstError
            layout={'vertical'}
            onFinish={(values) => onSubmit?.(_constructFormResponse(sdcForm, values, sdcResponse))}
        >
            <Row>
                <Col>
                    <Space direction={'horizontal'} size={'large'}>
                        <Title>{sdcForm.FormName}</Title>
                        <Text>Procedure {sdcForm.DiagnosticProcedureID}</Text>
                    </Space>
                </Col>
            </Row>
            <AntForm.Item
                label={'Patient ID'}
                name={PATIENT_ID_INPUT_NAME}
                rules={[{ required: true, message: 'Patient ID is required' }]}
                wrapperCol={{ lg: 5 }}
            >
                <Input disabled={disabled} />
            </AntForm.Item>
            <Divider />
            <Row>
                <Col flex={'auto'}>
                    {sdcForm.FormSections.map((s, i) => (
                        <FormSection key={i} section={s} disabled={disabled} />
                    ))}
                </Col>
            </Row>
            <AntForm.Item>
                <Button type={'primary'} htmlType={'submit'}>
                    Submit
                </Button>
            </AntForm.Item>
        </StyledForm>
    );
};

export default FormContainer;
