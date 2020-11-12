import axios from 'axios';
import { SDCFormListResponse, FormName } from 'utils/sdcTypes';

export const searchMetaDataList = async (FormName: FormName, offset: number): Promise<SDCFormListResponse> => {
    const response = await axios.get('/forms/search', { params: { FormName, offset } });
    return response.data;
};
