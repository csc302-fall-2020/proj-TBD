import { Col, Layout, Row, Button, Form, Input } from 'antd';
import { Rule } from 'antd/lib/form';
import { getUser } from 'common/AuthProvider/repository';
import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import styled from 'styled-components';

import { login } from '../repository';

const { Content } = Layout;

const LayoutFullHeight = styled(Layout)`
    height: 100vh;
`;

const RowWithMargin = styled(Row)`
    margin: 32px;
`;

const Card = styled(Col)`
    background: #fff;
    padding: 16px;
    display: flex;
    align-items: center;
    flex-direction: column;
`;

const StyledForm = styled(Form)`
    margin-top: 20px;
    width: 50%;
`;

const StyledButton = styled(Button)`
    width: 100%;
`;

const clinicianRules: Rule[] = [
    {
        required: true,
        pattern: /[0-9a-zA-Z]+/,
        validateTrigger: '-',
        validator: async (_, value, cb) => {
            const id = typeof value === 'string' ? value : '';

            if (id) {
                try {
                    await getUser(value as string);
                } catch (e) {
                    throw new Error(`Clinician '${value}' not found`);
                }
            } else {
                throw new Error('Enter a Clinician ID');
            }
        },
        whitespace: false
    }
];

const Login: React.FC = () => {
    const [loading, setLoading] = useState(false);
    const [form] = Form.useForm();
    const history = useHistory();

    const onFinish = async (values: any) => {
        const { clinicianID } = values;
        setLoading(true);
        try {
            await login(clinicianID);
            history.push(`${clinicianID}/home`);
        } catch (e) {
            form.setFields([{ name: 'clinicianID', errors: [e.message] }]);
            setLoading(false);
        }
    };

    return (
        <LayoutFullHeight data-testid="login-page">
            <Content>
                <RowWithMargin justify="center">
                    <Card xs={12}>
                        <h1>Welcome</h1>
                        <h3>Please enter your Clinician ID to continue</h3>
                        <StyledForm onFinish={onFinish} form={form}>
                            <Form.Item name="clinicianID" rules={clinicianRules}>
                                <Input placeholder="Clinician ID" />
                            </Form.Item>
                            <Form.Item>
                                <StyledButton type="primary" htmlType="submit" loading={loading}>
                                    Continue
                                </StyledButton>
                            </Form.Item>
                        </StyledForm>
                    </Card>
                </RowWithMargin>
            </Content>
        </LayoutFullHeight>
    );
};

export default Login;
