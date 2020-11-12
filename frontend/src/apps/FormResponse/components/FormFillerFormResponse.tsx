import React, { useCallback, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { Breadcrumb, Button, Col, Row, Space, Tooltip } from 'antd';
import { CloseOutlined, EditOutlined, LinkOutlined, PlusOutlined } from '@ant-design/icons';
import CopyToClipboard from 'react-copy-to-clipboard';

import { SDCFormResponse } from 'utils/sdcTypes';
import FormResponse, { FormWithResponse } from './FormResponse';

const _getShareableResponseURL = (response: SDCFormResponse) => {
    return `${window.location.origin}/#/responses/${response.FormResponseID}`;
};

type Params = {
    responseID: string;
    clinicianID: string;
};

const FormFillerFormResponse: React.FC = () => {
    const { responseID, clinicianID } = useParams<Params>();

    const [didCopyLink, setDidCopyLink] = useState(false);
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
                                        <Tooltip key={'make-revision'} title={'Make Revision'}>
                                            <Button
                                                type="ghost"
                                                shape="circle"
                                                icon={<EditOutlined />}
                                                onClick={() => setEnabled(true)}
                                            />
                                        </Tooltip>
                                    )}
                                    <Tooltip title={`New ${response.form.FormName}`}>
                                        <NavLink to={`/${clinicianID}/forms/${response.form.FormID}`}>
                                            <Button type="ghost" shape="circle" icon={<PlusOutlined />} />
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
                                            <Button type="primary" shape="circle" icon={<LinkOutlined />} />
                                        </CopyToClipboard>
                                    </Tooltip>
                                </>
                            )}
                        </Space>
                    </Col>
                </Row>
            )}
            <FormResponse responseID={responseID} onReceiveResponse={onReceiveResponse} enabled={enabled} />
        </>
    );
};

export default FormFillerFormResponse;
