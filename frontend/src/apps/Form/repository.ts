import { SDCForm, SDCFormResponse } from 'utils/sdcTypes';

export interface FormRepository {
    getForm(formId: string): Promise<SDCForm>;

    submitResponse(response: SDCFormResponse): Promise<void>;
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
                        SectionTitle: 'The Sky',
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
                        ],
                    },
                    {
                        SectionTitle: 'Colours',
                        Questions: [
                            {
                                QuestionType: 'multipleChoice',
                                enabled: true,
                                order: 0,
                                QuestionID: '2',
                                QuestionString: 'What is your favourite color?',
                                DependentQuestions: [],
                                options: ['Red', 'Blue', 'Green'],
                            },
                            {
                                QuestionType: 'radio',
                                enabled: true,
                                order: 0,
                                QuestionID: '3',
                                QuestionString: 'Are your answers honest?',
                                DependentQuestions: [],
                                options: ['Yes', 'No', 'Perhaps', 'Absolutely not'],
                            },
                        ],
                    },
                    {
                        SectionTitle: 'Numbers',
                        Questions: [
                            {
                                QuestionType: 'integer',
                                enabled: true,
                                order: 0,
                                QuestionID: '4',
                                QuestionString: 'What is 1+1',
                                DependentQuestions: [],
                            },
                            {
                                QuestionType: 'decimal',
                                enabled: true,
                                order: 0,
                                QuestionID: '5',
                                QuestionString: 'What is 1.5+1.5',
                                DependentQuestions: [],
                            }
                        ]
                    }
                ],
                Version: '1',
            };
        } else {
            console.log('error');
            throw new Error('Form not found');
        }
    }

    submitResponse(response: SDCFormResponse): Promise<void> {
        return Promise.resolve();
    }
}

export default SampleFormRepository;
