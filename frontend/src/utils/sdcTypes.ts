export const SDC_QUESTION_TYPE_STRING = 'string';
export const SDC_QUESTION_TYPE_MULTIPLE_CHOICE = 'multipleChoice';
export const SDC_QUESTION_TYPE_RADIO = 'radio';
export const SDC_QUESTION_TYPE_TRUE_FALSE = 'trueFalse';

interface SDCQuestionBase<T extends string> {
    QuestionID: number;
    QuestionString: string;
    QuestionType: T;
    enabled: boolean;
    order: number;
    DependentQuestions: SDCQuestion[];
}

export interface SDCStringQuestion extends SDCQuestionBase<typeof SDC_QUESTION_TYPE_STRING> {}

export interface SDCMultipleChoiceQuestion extends SDCQuestionBase<typeof SDC_QUESTION_TYPE_MULTIPLE_CHOICE> {
    options: string[];
}

export interface SDCRadioQuestion extends SDCQuestionBase<typeof SDC_QUESTION_TYPE_RADIO> {
    options: string[];
}

export interface SDCTrueFalseQuestion extends SDCQuestionBase<typeof SDC_QUESTION_TYPE_TRUE_FALSE> {}

export type SDCQuestion = SDCQuestionTypes[keyof SDCQuestionTypes];

export type SDCQuestionTypes = {
    [SDC_QUESTION_TYPE_STRING]: SDCStringQuestion;
    [SDC_QUESTION_TYPE_MULTIPLE_CHOICE]: SDCMultipleChoiceQuestion;
    [SDC_QUESTION_TYPE_RADIO]: SDCRadioQuestion;
    [SDC_QUESTION_TYPE_TRUE_FALSE]: SDCTrueFalseQuestion;
};

export interface SDCSection {
    Questions: SDCQuestion[];
}

export interface SDCForm {
    FormID: number;
    DiagnosticProcedureID: number;
    FormName: string;
    Version: number;
    FormSections: SDCSection[];
}

interface SDCAnswerBase<T extends SDCQuestion['QuestionType'], A> {
    QuestionID: number;
    AnswerType: T;
    Answer: A;
}

export type SDCStringAnswer = SDCAnswerBase<typeof SDC_QUESTION_TYPE_STRING, string>;
export type SDCMultipleChoiceAnswer = SDCAnswerBase<typeof SDC_QUESTION_TYPE_MULTIPLE_CHOICE, string[]>;
export type SDCRadioAnswer = SDCAnswerBase<typeof SDC_QUESTION_TYPE_RADIO, string>;
export type SDCTrueFalseAnswer = SDCAnswerBase<typeof SDC_QUESTION_TYPE_TRUE_FALSE, boolean>;

export type SDCAnswerTypes = {
    [SDC_QUESTION_TYPE_STRING]: SDCStringAnswer;
    [SDC_QUESTION_TYPE_MULTIPLE_CHOICE]: SDCMultipleChoiceAnswer;
    [SDC_QUESTION_TYPE_RADIO]: SDCRadioAnswer;
    [SDC_QUESTION_TYPE_TRUE_FALSE]: SDCTrueFalseAnswer;
};

export type SDCAnswer = SDCAnswerTypes[keyof SDCAnswerTypes];

export interface SDCFormResponse {
    FormResponseID: number;
    FormID: number;
    FormFillerID: number;
    Answers: { [key: string]: SDCAnswer };
}

export interface SDCFormMetaData {
    FormID: number;
    DiagnosticProcedureID: number;
    FormName: string;
}
