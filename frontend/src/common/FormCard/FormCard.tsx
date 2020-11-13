import React, { useState } from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { Card, Typography, Menu, Dropdown } from 'antd';
import { EllipsisOutlined } from '@ant-design/icons';
import CopyToClipboard from 'react-copy-to-clipboard';

import { SDCFormMetaData, FormID } from 'utils/sdcTypes';
import { useUser } from 'common/AuthProvider/AuthProvider';

const StyledCard = styled(Card)`
    width: 210px;
    max-width: 210px;
    height: 150px;
    max-height: 150px;
    margin: 15px;
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

const _getShareableFormURL = (FormID: FormID) => {
    return `${window.location.origin}/#/forms/${FormID}`;
};

interface Props {
    metaData: SDCFormMetaData;
    hasActions?: boolean;
}

const FormCard: React.FC<Props> = ({ metaData, hasActions = true }) => {
    const [didCopyLink, setDidCopyLink] = useState(false);
    const { FormID, FormName, Version } = metaData;
    const user = useUser();

    const handleCopyLink = (e: any) => {
        e.domEvent.stopPropagation();
        setDidCopyLink(true);
        setTimeout(() => setDidCopyLink(false), 1500);
    };

    const handleUpdateForm = (e: any) => {
        e.domEvent.stopPropagation();
    };

    const renderMenu = (
        <Menu>
            <Menu.Item onClick={handleCopyLink}>
                <CopyToClipboard text={_getShareableFormURL(FormID)}>
                    <div>{didCopyLink ? 'Copied!' : 'Copy Link'}</div>
                </CopyToClipboard>
            </Menu.Item>
            <Menu.Item onClick={handleUpdateForm}>Update Form</Menu.Item>
        </Menu>
    );

    return (
        <>
            <NavLink to={`/${user.FormFillerID}/forms/${FormID}`}>
                <StyledCard hoverable bodyStyle={{ height: '100%' }}>
                    <InnerWrapper>
                        <Typography.Paragraph ellipsis={{ rows: 3 }}>{FormName}</Typography.Paragraph>
                        <Footer>
                            <Card.Meta description={`V ${Version}`} />
                            {hasActions && (
                                <Dropdown overlay={renderMenu} trigger={['click']}>
                                    <EllipsisOutlined />
                                </Dropdown>
                            )}
                        </Footer>
                    </InnerWrapper>
                </StyledCard>
            </NavLink>
        </>
    );
};

export default FormCard;
