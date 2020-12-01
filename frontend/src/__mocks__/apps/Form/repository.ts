import { SDCForm, SDCFormResponseForSubmission, SDCFormResponseResponse } from 'utils/sdcTypes';

jest.mock('apps/Form/repository', () => {
    const repository = {
        async submitResponse(response: SDCFormResponseForSubmission): Promise<SDCFormResponseResponse> {
            return {
                FormResponseID: 'form_response_id',
                CreateTime: '2020-01-01T00:00:00Z'
            };
        },
        getForm(formId: string): Promise<SDCForm> {
            throw new Error('not implemented');
        },
        async updateResponse(response: SDCFormResponseForSubmission): Promise<SDCFormResponseResponse> {
            return {
                FormResponseID: 'form_response_id',
                CreateTime: '2020-01-01T00:00:00Z'
            };
        }
    };

    return {
        default: repository,
        __esModule: true
    };
});