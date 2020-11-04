import { SDCForm } from 'utils/sdcTypes';

export interface FormRepository {
    getForm(formId: string): Promise<SDCForm>;
}

class SampleFormRepository implements FormRepository {
    async getForm(formId: string): Promise<SDCForm> {
        await new Promise((res) => setTimeout(() => res(), 500));

        if (formId === '1') {
            return {
                FormID: formId,
                DiagnosticProcedureID: '514213',
                FormName: 'My Medical Form',
                FormSections: [
                    {
                        Questions: [
                            {
                                QuestionType: 'string',
                                enabled: true,
                                order: 0,
                                QuestionID: '1',
                                QuestionString: 'What colour is the sky?',
                                DependentQuestions: [
                                    {
                                        QuestionType: 'trueFalse',
                                        enabled: true,
                                        order: 1,
                                        QuestionID: '1234',
                                        QuestionString: 'Is it overcast?',
                                        DependentQuestions: [],
                                    },
                                ],
                            },
                            {
                                QuestionType: 'multipleChoice',
                                enabled: true,
                                order: 0,
                                QuestionID: '1',
                                QuestionString: 'What is your favourite color?',
                                DependentQuestions: [],
                                options: ['Red', 'Blue', 'Green'],
                            },
                        ],
                    },
                ],
                Version: '1',
            };
        } else {
            console.log('error');
            throw new Error('Form not found');
        }
    }
}

export default SampleFormRepository;
