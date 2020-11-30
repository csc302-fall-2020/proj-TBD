import React, { useState } from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { Card, Typography, Menu, Dropdown } from 'antd';
import { EllipsisOutlined } from '@ant-design/icons';
//import CopyToClipboard from 'react-copy-to-clipboard';

import { SDCFormMetaData, FormID, FormFillerID } from 'utils/sdcTypes';
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

// const _getShareableFormURL = (FormFillerID: FormFillerID, FormID: FormID) => {
//     return `${window.location.origin}/#/${FormFillerID}/forms/${FormID}`;
// };

interface Props {
    metaData: SDCFormMetaData;
    hasActions?: boolean;
    openUploadModal?: () => void;
}

const FormCard: React.FC<Props> = ({ metaData, hasActions = true, openUploadModal }) => {
    //const [didCopyLink, setDidCopyLink] = useState(false);
    const { FormID, FormName, Version } = metaData;
    const user = useUser();

    // const handleCopyLink = (e: any) => {
    //     e.domEvent.stopPropagation();
    //     setDidCopyLink(true);
    //     setTimeout(() => setDidCopyLink(false), 1500);
    // };

    const handleUpdateForm = (e: any) => {
        e.domEvent.stopPropagation();
        if(openUploadModal){
            openUploadModal();
        }
    };

    const renderMenu = (
        <Menu>
            {/* <Menu.Item onClick={handleCopyLink}>
                <CopyToClipboard text={_getShareableFormURL(user.FormFillerID, FormID)}>
                    <div>{didCopyLink ? 'Copied!' : 'Copy Link'}</div>
                </CopyToClipboard>
            </Menu.Item> */}
            <Menu.Item onClick={handleUpdateForm}>Update Form</Menu.Item>
        </Menu>
    );

    return (
        <>
            <NavLink to={`/${user.FormFillerID}/forms/${FormID}`}>
                <StyledCard hoverable bodyStyle={{ height: '100%' }} data-testid={`form-${FormID}`}>
                    <InnerWrapper>
                        <Typography.Paragraph ellipsis={{ rows: 3 }}>{FormName}</Typography.Paragraph>
                        <Footer>
                            <Card.Meta description={`V ${Version}`} />
                            {hasActions && (
                                <Dropdown overlay={renderMenu} trigger={['click']}>
                                    <EllipsisOutlined data-testid="form-card-actions" />
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
