export const SDC_QUESTION_TYPE_STRING = 'string';
export const SDC_QUESTION_TYPE_MULTIPLE_CHOICE = 'multipleChoice';
export const SDC_QUESTION_TYPE_RADIO = 'radio';
export const SDC_QUESTION_TYPE_TRUE_FALSE = 'trueFalse';

export type DiagnosticProcedureID = string;
export type PatientID = string;
export type FormFillerID = string;
export type FormID = string;
export type QuestionID = string;
export type FormResponseID = string;

interface SDCQuestionBase<T extends string> {
    QuestionID: QuestionID;
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
    FormID: FormID;
    DiagnosticProcedureID: DiagnosticProcedureID;
    FormName: string;
    Version: string;
    FormSections: SDCSection[];
}

interface SDCAnswerBase<T extends SDCQuestion['QuestionType'], A> {
    QuestionID: QuestionID;
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
    FormResponseID: FormResponseID;
    FormID: FormID;
    DiagnosticProcedureID: DiagnosticProcedureID;
    PatientID: PatientID;
    FormFillerID: FormFillerID;
    Answers: { [key: string]: SDCAnswer };
}

export interface SDCFormMetaData {
    FormID: FormID;
    DiagnosticProcedureID: DiagnosticProcedureID;
    FormName: string;
}
