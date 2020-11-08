import React, { useCallback, useState } from 'react';
import { Modal, Upload, message } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { uploadForm, updateForm } from '../repository';
import _ from 'lodash';

export type UploadFormProps = {
    open: boolean;
    onClose: () => void;
    isNewForm: boolean;
    onComplete: () => Promise<void>;
};

const { Dragger } = Upload;

const UploadFormModal: React.FC<UploadFormProps> = ({ open, onClose, isNewForm, onComplete }) => {
    const [fileList, setFileList] = useState<Array<any>>([]);
    const [uploading, setUploading] = useState<boolean>(false);
    const beforeUpload: (file: File) => boolean = useCallback((file) => {
        setFileList([file]);
        return false;
    }, []);
    const onRemove: () => void = useCallback(() => {
        setFileList([]);
    }, []);
    const onUpload: () => void = useCallback(() => {
        (async () => {
            try {
                setUploading(true);
                if (isNewForm) {
                    await uploadForm(fileList[0]);
                } else {
                    await updateForm(fileList[0]);
                }
                setUploading(false);
                message.success(`Form ${isNewForm ? 'uploaded' : 'updated'}!`);
                await onComplete();
                onClose();
            } catch (err) {
                setUploading(false);
                message.error('Something went wrong, please try again');
            }
        })();
    }, [fileList, isNewForm, onClose, onComplete]);
    const onCancel = useCallback(() => {
        if (!uploading) {
            onClose();
        }
    }, [uploading]);
    const afterClose = useCallback(() => {
        setFileList([]);
    }, []);
    return (
        <Modal
            title={`${isNewForm ? 'Upload' : 'Update'} Form`}
            visible={open}
            onOk={onUpload}
            onCancel={onCancel}
            afterClose={afterClose}
            okButtonProps={{ disabled: uploading || _.isEmpty(fileList) }}
            okText="Upload"
            confirmLoading={uploading}
        >
            <Dragger
                name="file"
                multiple={false}
                accept=".xml"
                fileList={fileList}
                onRemove={onRemove}
                beforeUpload={beforeUpload}
            >
                <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                </p>
                <p className="ant-upload-text">Click or drag file to this area to upload</p>
            </Dragger>
        </Modal>
    );
};

export default UploadFormModal;
