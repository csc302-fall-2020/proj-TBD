import { FormResponseRepository } from 'apps/FormResponse/repository';

jest.mock('apps/FormResponse/repository', () => {
    const repository: Partial<FormResponseRepository> = {
        async getResponse(responseID) {
            const responseBase = {
                form: {
                    CreateTime: '2020-01-01T00:00:00Z',
                    FormID: 'form_id',
                    DiagnosticProcedureID: '',
                    FormName: 'form_name',
                    FormSections: [],
                    Version: 'form_version'
                },
                response: {
                    Answers: {},
                    CreateTime: '2020-01-01T00:00:00Z',
                    FormFillerID: 'form_filler_id',
                    FormID: 'form_id',
                    FormResponseID: 'response_draft',
                    IsDraft: true,
                    PatientID: 'patient_id',
                    Version: 'response_version'
                }
            };

            if (responseID === 'response_draft') {
                return responseBase;
            } else if (responseID === 'response') {
                return {
                    ...responseBase,
                    response: {
                        ...responseBase.response,
                        FormResponseID: 'response',
                        IsDraft: false
                    }
                };
            }
            throw new Error('form_not_found_error');
        },
        async deleteDraftResponse(_: string): Promise<boolean> {
            return true;
        }
    };

    return {
        default: repository,
        __esModule: true
    };
});

export {};