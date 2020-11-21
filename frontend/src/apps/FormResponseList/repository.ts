import axios from 'axios';
import { SDCFormResponseParams, SDCFormResponseListResponse } from 'utils/sdcTypes';

export const getFormResponses = async(params?:SDCFormResponseParams): Promise<SDCFormResponseListResponse> => {
    const response = await axios.get('/form-responses/search', {params});
    return response.data;
};




