import React from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { Card, Typography, Menu, Dropdown } from 'antd';
import { EllipsisOutlined } from '@ant-design/icons';

import { SDCFormMetaData } from 'utils/sdcTypes';
import { getCurrentUser } from 'utils/user';

const StyledCard = styled(Card)`
    width: 210px;
    max-width: 210px;
    height: 150px;
    max-height: 150px;
    margin: 20px;
`;

const InnerWrapper = styled.div`
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
`;

const Footer = styled.div`
    display: flex;
    justify-content: space-between;
`;

interface Props {
    metaData: SDCFormMetaData;
}

const FormCard: React.FC<Props> = ({ metaData }) => {
    const handleCopyLink = () => {};

    const handleUpdateForm = () => {};

    const handleDeleteForm = () => {};

    const renderMenu = (
        <Menu>
            <Menu.Item onClick={handleCopyLink}>Copy Link</Menu.Item>
            <Menu.Item onClick={handleUpdateForm}>Update Form</Menu.Item>
            <Menu.Item danger onClick={handleDeleteForm}>
                Delete Form
            </Menu.Item>
        </Menu>
    );

    const { FormID, FormName, Version } = metaData;
    return (
        <NavLink to={`/${getCurrentUser().getID()}/forms/${FormID}`}>
            <StyledCard hoverable bodyStyle={{ height: '100%' }}>
                <InnerWrapper>
                    <Typography.Paragraph ellipsis={{ rows: 3 }}>{FormName}</Typography.Paragraph>
                    <Footer>
                        <Card.Meta description={`V ${Version}`} />
                        <Dropdown overlay={renderMenu} trigger={['click']}>
                            <EllipsisOutlined />
                        </Dropdown>
                    </Footer>
                </InnerWrapper>
            </StyledCard>
        </NavLink>
    );
};

export default FormCard;
