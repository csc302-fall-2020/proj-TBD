import axios from 'axios';
import { SDCForm, SDCFormResponse } from 'utils/sdcTypes';

export type FormResponseWithForm = {
    form: SDCForm;
    response: SDCFormResponse;
};

interface FormResponseRepository {
    getResponse(responseID: string): Promise<FormResponseWithForm>;

    deleteDraftResponse(responseID: string): Promise<boolean>;
}

const formResponseRepository: FormResponseRepository = {
    async getResponse(responseID: string): Promise<FormResponseWithForm> {
        const response = await axios.get(`/form-responses/${responseID}`);

        const data = response.data as { form: SDCForm; 'form-response': SDCFormResponse };

        const result = {
            form: data.form,
            response: data['form-response']
        };

        if (!result.form || !result.response) {
            throw new Error('Form response not found');
        }

        return result;
    },
    async deleteDraftResponse(responseID: string): Promise<boolean> {
        const response = await axios.delete(`/form-responses/${responseID}`);

        return response.data.success as boolean;
    }
};

export default formResponseRepository;
