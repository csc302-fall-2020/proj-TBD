import React, { useCallback, useState } from 'react';
import { NavLink, Redirect, useParams } from 'react-router-dom';
import { Breadcrumb, Button, Col, Row, Space, Tooltip, Modal, message } from 'antd';
import {
    CloseOutlined,
    DeleteOutlined,
    EditOutlined,
    LinkOutlined,
    PlusOutlined,
    ExclamationCircleOutlined
} from '@ant-design/icons';
import CopyToClipboard from 'react-copy-to-clipboard';
import { SDCFormResponse } from 'utils/sdcTypes';
import FormResponse, { FormWithResponse } from './FormResponse';
import formResponseRepository from '../repository';

const { confirm } = Modal;

const _getShareableResponseURL = (response: SDCFormResponse) => {
    return `${window.location.origin}/#/responses/${response.FormResponseID}`;
};

const _showConfirmDelete = (onDelete: () => void) =>
    confirm({
        title: 'Are you sure you want to delete this draft?',
        icon: <ExclamationCircleOutlined />,
        content: 'Once the draft is deleted, it cannot be restored.',
        onOk: onDelete,
        okText: 'Delete'
    });

type Params = {
    responseID: string;
    clinicianID: string;
};

const FormFillerFormResponse: React.FC = () => {
    const { responseID, clinicianID } = useParams<Params>();

    const [didCopyLink, setDidCopyLink] = useState(false);
    const [didDeleteResponse, setDidDeleteResponse] = useState(false);
    const [isDeletingResponse, setDeletingResponse] = useState(false);
    const [response, setResponse] = useState<FormWithResponse | null>(null);
    const [enabled, setEnabled] = useState(false);

    const onReceiveResponse = useCallback((newResponse) => {
        setResponse((response) => {
            if (response !== newResponse) {
                setEnabled(false);
            }

            return newResponse;
        });
    }, []);

    const onDeleteResponse = useCallback(() => {
        const _doDelete = async () => {
            setDeletingResponse(true);
            try {
                await formResponseRepository.deleteDraftResponse(responseID);
                setDidDeleteResponse(true);
                message.success('Deleted draft');
            } catch (e) {
                message.error(e.message);
            }

            setDeletingResponse(false);
        };

        _doDelete();
    }, [responseID, setDeletingResponse]);

    if (didDeleteResponse) {
        return <Redirect to={`/${clinicianID}/responses`} />;
    }

    const disabled = isDeletingResponse;

    return (
        <>
            {response && (
                <Row>
                    <Col flex={'auto'}>
                        <Breadcrumb>
                            <Breadcrumb.Item>
                                <NavLink to={`/${clinicianID}/responses`}>Responses</NavLink>
                            </Breadcrumb.Item>
                            <Breadcrumb.Item>Response {responseID}</Breadcrumb.Item>
                        </Breadcrumb>
                    </Col>
                    <Col>
                        <Space direction={'horizontal'}>
                            {enabled ? (
                                <>
                                    <Tooltip key={'cancel-revision'} title={'Cancel Revision'}>
                                        <Button
                                            type="ghost"
                                            shape="circle"
                                            icon={<CloseOutlined />}
                                            onClick={() => setEnabled(false)}
                                        />
                                    </Tooltip>
                                </>
                            ) : (
                                <>
                                    {response.response.IsDraft && (
                                        <>
                                            <Tooltip key={'delete-draft'} title={'Delete Draft'}>
                                                <Button
                                                    type="ghost"
                                                    shape="circle"
                                                    danger
                                                    loading={isDeletingResponse}
                                                    icon={<DeleteOutlined />}
                                                    onClick={() => _showConfirmDelete(onDeleteResponse)}
                                                />
                                            </Tooltip>
                                            <Tooltip key={'make-revision'} title={'Make Revision'}>
                                                <Button
                                                    type="ghost"
                                                    shape="circle"
                                                    disabled={disabled}
                                                    icon={<EditOutlined />}
                                                    onClick={() => setEnabled(true)}
                                                />
                                            </Tooltip>
                                        </>
                                    )}
                                    <Tooltip title={`New ${response.form.FormName}`}>
                                        <NavLink to={`/${clinicianID}/forms/${response.form.FormID}`}>
                                            <Button
                                                type="ghost"
                                                shape="circle"
                                                icon={<PlusOutlined />}
                                                disabled={disabled}
                                            />
                                        </NavLink>
                                    </Tooltip>

                                    <Tooltip
                                        title={didCopyLink ? 'Copied!' : 'Share link'}
                                        onVisibleChange={(visible) => visible && setDidCopyLink(false)}
                                    >
                                        <CopyToClipboard
                                            onCopy={() => setDidCopyLink(true)}
                                            text={_getShareableResponseURL(response.response)}
                                        >
                                            <Button
                                                type="primary"
                                                shape="circle"
                                                icon={<LinkOutlined />}
                                                disabled={disabled}
                                            />
                                        </CopyToClipboard>
                                    </Tooltip>
                                </>
                            )}
                        </Space>
                    </Col>
                </Row>
            )}
            <FormResponse
                responseID={responseID}
                onReceiveResponse={onReceiveResponse}
                enabled={enabled && !disabled}
            />
        </>
    );
};

export default FormFillerFormResponse;
