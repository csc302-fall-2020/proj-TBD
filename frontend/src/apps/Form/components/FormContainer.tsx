import React, { useCallback, useEffect, useState } from 'react';
import { Button, Col, Divider, Form as AntForm, Form, Input, Row, Space, Typography, Modal, message } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import {
    SDCAnswer,
    SDCClinician,
    SDCForm,
    SDCFormResponse,
    SDCFormResponseForSubmission,
    SDCQuestion,
    SDCSection
} from 'utils/sdcTypes';
import FormSection from './FormSection';
import styled from 'styled-components';
import { PATIENT_ID_INPUT_NAME } from '../constants';
import formRepository from '../repository';
import { Redirect } from 'react-router-dom';
import { isEqual } from 'lodash';
import { useUser } from 'common/AuthProvider/AuthProvider';

const { Title, Text } = Typography;
const { confirm } = Modal;

/**
 * Gets all questions including and inside a question
 */
const _getQuestions = (question: SDCQuestion): SDCQuestion[] => {
    return question.DependentQuestions.reduce((prev, curr) => [...prev, ..._getQuestions(curr)], [question]);
};

/**
 * Gets all questions for a form
 */
const _getFormQuestions = (form: SDCForm): SDCQuestion[] => {
    return _getFormQuestionsFromSections(form.FormSections);
};

const _getFormQuestionsFromSections = (sections: SDCSection[]): SDCQuestion[] => {
    return sections.reduce(
        (prev, curr) => [
            ...prev,
            ...curr.Questions.reduce<SDCQuestion[]>((a, q) => [...a, ..._getQuestions(q)], []),
            ...(curr.Sections?.reduce<SDCQuestion[]>((a, s) => [...a, ..._getFormQuestionsFromSections([s])], []) ?? [])
        ],
        [] as SDCQuestion[]
    );
};

/**
 * Given form values from the AntDesign Form (dict. of questionId: answer) construct a form response
 */
const _constructFormResponse = (
    user: SDCClinician,
    form: SDCForm,
    formValues: any,
    isDraft: boolean,
    previousResponse?: SDCFormResponse
) => {
    const questions = _getFormQuestions(form);

    const answers: { [questionID: string]: SDCAnswer } = {};
    questions.forEach(<T extends SDCQuestion>(q: T) => {
        if (formValues[q.QuestionID] !== undefined) {
            const answer = {
                QuestionID: q.QuestionID,
                Answer: formValues[q.QuestionID],
                AnswerType: q.QuestionType
            };

            answers[q.QuestionID] = answer;
        }
    });

    const response: SDCFormResponseForSubmission = {
        FormResponseID: previousResponse?.FormResponseID,
        PatientID: formValues[PATIENT_ID_INPUT_NAME] as string,
        FormID: form.FormID,
        FormFillerID: user.FormFillerID,
        Answers: answers,
        IsDraft: isDraft,
        Version: form.Version
    };

    return response;
};

const _constructFormFieldData = (form: SDCForm, response: SDCFormResponse) => {
    const questions = _getFormQuestions(form);

    return [
        ...questions.map((question) => ({
            name: question.QuestionID,
            value: response.Answers[question.QuestionID]?.Answer
        })),
        { name: PATIENT_ID_INPUT_NAME, value: response.PatientID }
    ];
};

const _constructInitialFormData = (form: SDCForm, response: SDCFormResponse): Record<string, SDCAnswer['Answer']> => {
    const fieldData = _constructFormFieldData(form, response);

    const data: Record<string, SDCAnswer['Answer']> = {};
    fieldData.forEach((d) => (data[d.name] = d.value));

    return data;
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
    disabled?: boolean;
    onSubmit?: (response: SDCFormResponse) => void;
};

const FormContainer: React.FC<FormContainerProps> = (props) => {
    const { form: sdcForm, response: sdcResponse, onSubmit } = props;

    const [form] = Form.useForm();
    const [initialData] = useState(sdcResponse ? _constructInitialFormData(sdcForm, sdcResponse) : null);
    const [isDraft, setDraft] = useState(false);
    const [loading, setLoading] = useState(false);
    const [responseID, setResponseID] = useState<string | null>(null);
    const user = useUser();

    const disabled = loading || props.disabled;

    useEffect(() => {
        if (sdcResponse) {
            form.setFields(_constructFormFieldData(sdcForm, sdcResponse));
        }
    }, [sdcResponse, sdcForm, form]);

    const doSubmit = useCallback(
        (values: any) => {
            const _doSubmit = async () => {
                setLoading(true);

                let submittedResponse: SDCFormResponse | undefined;
                try {
                    const response = _constructFormResponse(user, sdcForm, values, isDraft, sdcResponse);
                    if (response.FormResponseID) {
                        const { CreateTime } = await formRepository.updateResponse(response);

                        submittedResponse = {
                            ...response,
                            FormResponseID: response.FormResponseID,
                            CreateTime
                        };
                    } else {
                        const { FormResponseID, CreateTime } = await formRepository.submitResponse(response);

                        submittedResponse = {
                            ...response,
                            FormResponseID,
                            CreateTime
                        };
                    }

                    if (response.IsDraft) {
                        message.success('Draft is saved!');
                    } else {
                        message.success('Submit successfully!');
                    }
                } catch (e) {
                    message.error(e.message);
                } finally {
                    setLoading(false);

                    if (submittedResponse) {
                        onSubmit?.(submittedResponse);
                        setResponseID(submittedResponse.FormResponseID);
                    }
                }
            };

            _doSubmit();
        },
        [isDraft, sdcForm, sdcResponse, onSubmit, user]
    );

    function showConfirm() {
        confirm({
            title: 'Do you want to submit the form?',
            icon: <ExclamationCircleOutlined />,
            content:
                'Once the form is submitted, you cannot edit it anymore. You can view the responses at the responses page after submit.',
            onOk() {
                setDraft(false);
                form.submit();
            },
            onCancel() {
                console.log('Cancel');
            }
        });
    }

    if (responseID && responseID !== sdcResponse?.FormResponseID) {
        return <Redirect to={`/${user.FormFillerID}/responses/${responseID}`} />;
    }

    return (
        <StyledForm
            initialValues={initialData ?? undefined}
            form={form}
            scrollToFirstError
            layout={'vertical'}
            onFinish={(values) => !loading && doSubmit(values)}
            onFinishFailed={(error) => {
                if (!loading && isDraft) {
                    // Some questions (patient ID) are always mandatory
                    if (error.errorFields.find((field) => isEqual(field.name, [PATIENT_ID_INPUT_NAME]))) {
                        return;
                    }

                    const formValues = form.getFieldsValue();

                    // Otherwise we submit the draft response
                    doSubmit(formValues);

                    // We need to clear question fields of any errors they may have
                    // (which are ignored b/c it's a draft submit)
                    form.resetFields();
                    form.setFields(Object.keys(formValues).map((name) => ({ name, value: formValues[name] })));
                }
            }}
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
                        <FormSection key={i} initialValues={initialData ?? undefined} section={s} disabled={disabled} />
                    ))}
                </Col>
            </Row>
            {(loading || !disabled) && (
                <AntForm.Item>
                    <Space size={'middle'}>
                        <Button
                            type={'default'}
                            disabled={loading}
                            loading={loading && isDraft}
                            onClick={() => {
                                setDraft(true);
                                form.submit();
                            }}
                        >
                            Save to draft
                        </Button>
                        <Button
                            disabled={loading}
                            loading={loading && !isDraft}
                            type={'primary'}
                            onClick={() => {
                                showConfirm();
                            }}
                        >
                            Submit
                        </Button>
                    </Space>
                </AntForm.Item>
            )}
        </StyledForm>
    );
};

export default FormContainer;
