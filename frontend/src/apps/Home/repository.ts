import axios from 'axios';
import { HomePageResponse } from 'utils/sdcTypes';

export const getHomeData = async (clinicianID: string): Promise<HomePageResponse> => {
    const response = await axios.get(`/home/${clinicianID}`);

    return response.data;
};
