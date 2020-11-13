import { SDCClinician } from 'utils/sdcTypes';
import axios from 'axios';

export const getUser = async (formFillerID: string): Promise<SDCClinician> => {
    const response = await axios.get(`/clinicians/${formFillerID}`);

    return response.data as SDCClinician;
};
