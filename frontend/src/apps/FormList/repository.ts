import axios from 'axios';
import { SDCFormMetaData } from 'utils/sdcTypes';

export const getFormMetaDataList = async ({}): Promise<Array<SDCFormMetaData>> => {
    const response = await axios.get('/forms');
    return response.data;
};
