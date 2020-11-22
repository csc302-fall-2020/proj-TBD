import { SDCForm, SDCFormResponse, SDCFormResponseForSubmission, SDCFormResponseResponse } from 'utils/sdcTypes';
import axios from 'axios';

export interface FormRepository {
    getForm(formId: string): Promise<SDCForm>;

    updateResponse(response: SDCFormResponseForSubmission): Promise<SDCFormResponseResponse>;

    submitResponse(response: SDCFormResponseForSubmission): Promise<SDCFormResponseResponse>;
}

const formRepository: FormRepository = {
    async submitResponse(response: SDCFormResponse): Promise<SDCFormResponseResponse> {
        const axiosResponse = await axios.post('/form-responses', response);

        return axiosResponse.data as SDCFormResponseResponse;
    },

    async updateResponse(response: SDCFormResponse): Promise<SDCFormResponseResponse> {
        const axiosResponse = await axios.patch(`/form-responses/${response.FormResponseID}`, response);

        return axiosResponse.data as SDCFormResponseResponse;
    },

    async getForm(formId: string): Promise<SDCForm> {
        const response = await axios.get(`/forms/${formId}`);
        return response.data as SDCForm;
    }
};

export default formRepository;
