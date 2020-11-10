import React, { useState } from 'react';
import styled from 'styled-components';
import { NavLink } from 'react-router-dom';
import { Card, Typography, Menu, Dropdown, Modal, message } from 'antd';
import { EllipsisOutlined } from '@ant-design/icons';
import CopyToClipboard from 'react-copy-to-clipboard';

import { deleteForm } from './repository';

import { SDCFormMetaData, FormID } from 'utils/sdcTypes';
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

const _getShareableFormURL = (FormID: FormID) => {
    return `${window.location.origin}/#/forms/${FormID}`;
};

interface Props {
    metaData: SDCFormMetaData;
}

const FormCard: React.FC<Props> = ({ metaData }) => {
    const [didCopyLink, setDidCopyLink] = useState(false);
    const [deleteModalVisible, setDeleteModalVisible] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const { FormID, FormName, Version } = metaData;

    const handleCopyLink = (e: any) => {
        e.domEvent.stopPropagation();
        setDidCopyLink(true);
        setTimeout(() => setDidCopyLink(false), 1500);
    };

    const handleUpdateForm = (e: any) => {
        e.domEvent.stopPropagation();
    };

    const handleShowDeleteFormModal = (e: any) => {
        e.domEvent.stopPropagation();
        setDeleteModalVisible(true);
    };

    const handleHideDeleteFormModal = () => setDeleteModalVisible(false);

    const handleDeleteForm = async () => {
        try {
            setDeleting(true);
            await deleteForm(FormID);
            setDeleteModalVisible(false);
        } catch (e) {
            message.error('Something went wrong! Please try again.');
        }
        setDeleting(false);
    };

    const renderMenu = (
        <Menu>
            <Menu.Item onClick={handleCopyLink}>
                <CopyToClipboard text={_getShareableFormURL(FormID)}>
                    <div>{didCopyLink ? 'Copied!' : 'Copy Link'}</div>
                </CopyToClipboard>
            </Menu.Item>
            <Menu.Item onClick={handleUpdateForm}>Update Form</Menu.Item>
            <Menu.Item danger onClick={handleShowDeleteFormModal}>
                Delete Form
            </Menu.Item>
        </Menu>
    );

    return (
        <>
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
            <Modal
                title="Delete Form"
                visible={deleteModalVisible}
                okType="danger"
                okText="Delete"
                onOk={handleDeleteForm}
                onCancel={handleHideDeleteFormModal}
                okButtonProps={{ loading: deleting }}
            >
                {`Are you sure you want to delete the form "${FormName}"?`}
            </Modal>
        </>
    );
};

export default FormCard;
