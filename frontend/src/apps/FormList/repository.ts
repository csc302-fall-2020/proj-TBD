import axios from 'axios';
import { SDCFormListResponse, FormName } from 'utils/sdcTypes';

export const searchMetaDataList = async (FormName: FormName, offset: number): Promise<SDCFormListResponse> => {
    const response = await axios.get('/forms/search', { params: { FormName, offset } });
    return response.data;
};

interface UploadConfig {
    formData: FormData;
    config: Object;
}

const getUploadConfig: (file: File) => UploadConfig = (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return ({
        config: {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        },
        formData
    });
}

export const uploadForm = async (file: File): Promise<void> => {
    const { formData, config } = getUploadConfig(file);
    await axios.post(`/forms`, formData, config);
    return;
};

export const updateForm = async (file: File): Promise<void> => {
    const { formData, config } = getUploadConfig(file);
    await axios.patch(`/forms`, formData, config);
    return;
};
