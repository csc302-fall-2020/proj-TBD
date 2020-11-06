import axios from 'axios';
import { SDCFormResponse } from 'utils/sdcTypes';

interface FormResponseRepository {
    getResponse(responseID: string): Promise<SDCFormResponse>;
}

const formResponseRepository: FormResponseRepository = {
    async getResponse(responseID: string): Promise<SDCFormResponse> {
        const response = await axios.get(`/form-responses/${responseID}`);

        const forms = response.data as SDCFormResponse[];
        if (forms.length > 0) {
            return forms[0];
        }

        throw new Error('Form response not found');
    },
};

export default formResponseRepository;
