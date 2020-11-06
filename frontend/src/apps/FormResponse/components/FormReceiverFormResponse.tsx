import React from 'react';
import { useParams } from 'react-router-dom';
import FormResponse from './FormResponse';
import styled from 'styled-components';
import { Col, Row, Layout } from 'antd';

const { Content } = Layout;
type Params = {
    responseID: string;
};

const LayoutFullHeight = styled(Layout)`
    height: 100vh;
    overflow: auto;
`;

const RowWithMargin = styled(Row)`
    margin: 32px;
`;

const ColAsCard = styled(Col)`
    background: #fff;
    padding: 16px;
`;

const FormReceiverFormResponse: React.FC = () => {
    const { responseID } = useParams<Params>();

    return (
        <LayoutFullHeight>
            <Content>
                <RowWithMargin justify={'center'}>
                    <ColAsCard xl={12} lg={16} md={20} xs={24}>
                        <FormResponse responseID={responseID} />
                    </ColAsCard>
                </RowWithMargin>
            </Content>
        </LayoutFullHeight>
    );
};

export default FormReceiverFormResponse;
