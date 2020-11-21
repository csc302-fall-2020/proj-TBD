import { SDCForm, SDCFormResponse, SDCFormResponseForSubmission } from 'utils/sdcTypes';
import axios from 'axios';

export interface FormRepository {
    getForm(formId: string): Promise<SDCForm>;

    updateResponse(response: SDCFormResponseForSubmission): Promise<boolean>;

    submitResponse(response: SDCFormResponseForSubmission): Promise<string>;
}

class SampleFormRepository implements FormRepository {
    async getForm(formId: string): Promise<SDCForm> {
//        await new Promise((res) => setTimeout(() => res(), 500));

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
                                enabledState: null,
                                order: 0,
                                QuestionID: '1',
                                QuestionString: 'What colour is the sky?',
                                DependentQuestions: [
                                    {
                                        QuestionType: 'trueFalse',
                                        enabledState: null,
                                        order: 1,
                                        QuestionID: '1234',
                                        QuestionString: 'Is it overcast?',
                                        DependentQuestions: [
                                            {
                                                QuestionType: 'string',
                                                enabledState: true,
                                                order: 0,
                                                QuestionID: '8',
                                                QuestionString: 'Is it going to rain?',
                                                DependentQuestions: []
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        SectionTitle: 'Colours',
                        Questions: [
                            {
                                QuestionType: 'multipleChoice',
                                enabledState: null,
                                order: 0,
                                QuestionID: '2',
                                QuestionString: 'What is your favourite color?',
                                DependentQuestions: [
                                    {
                                        QuestionType: 'radio',
                                        enabledState: ['Red', 'Blue', 'Green'],
                                        order: 0,
                                        QuestionID: '6',
                                        QuestionString: 'Are you sure?',
                                        DependentQuestions: [],
                                        options: ['Yes', 'No']
                                    }
                                ],
                                options: ['Red', 'Blue', 'Green']
                            },
                            {
                                QuestionType: 'radio',
                                enabledState: null,
                                order: 0,
                                QuestionID: '3',
                                QuestionString: 'Are your answers honest?',
                                DependentQuestions: [
                                    {
                                        QuestionType: 'string',
                                        enabledState: 'Yes',
                                        order: 0,
                                        QuestionID: '7',
                                        QuestionString: 'Why?',
                                        DependentQuestions: []
                                    }
                                ],
                                options: ['Yes', 'No', 'Perhaps', 'Absolutely not']
                            }
                        ]
                    },
                    {
                        SectionTitle: 'Numbers',
                        Questions: [
                            {
                                QuestionType: 'integer',
                                enabledState: null,
                                order: 0,
                                QuestionID: '4',
                                QuestionString: 'What is 1+1',
                                DependentQuestions: []
                            },
                            {
                                QuestionType: 'decimal',
                                enabledState: null,
                                order: 0,
                                QuestionID: '5',
                                QuestionString: 'What is 1.5+1.5',
                                DependentQuestions: []
                            }
                        ]
                    }
                ],
                Version: '1'
            };
        } else {
            console.log('error');
            throw new Error('Form not found');
        }
    }

    updateResponse(response: SDCFormResponse): Promise<boolean> {
        return Promise.resolve(true);
    }

    submitResponse(response: SDCFormResponse): Promise<string> {
        return Promise.resolve('1');
    }
}

const formRepository: FormRepository = {
    async submitResponse(response: SDCFormResponse): Promise<string> {
        const axiosResponse = await axios.post('/form-responses', response);

        return axiosResponse.data as string;
    },

    async updateResponse(response: SDCFormResponse): Promise<boolean> {
        const axiosResponse = await axios.patch(`/form-responses/${response.FormResponseID}`, response);

        return axiosResponse.data;
    },

    async getForm(formId: string): Promise<SDCForm> {
        const response = await axios.get(`/forms/${formId}`);
        return response.data as SDCForm;
    }
};

export default formRepository;
