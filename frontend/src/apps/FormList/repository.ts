import axios from 'axios';
import { SDCFormMetaData, FormName } from 'utils/sdcTypes';

export const searchMetaDataList = async (FormName: FormName): Promise<Array<SDCFormMetaData>> => {
    const response = await axios.get('/forms/search', { params: { FormName } });
    return response.data;
};
