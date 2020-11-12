export const SDC_QUESTION_TYPE_STRING = 'string';
export const SDC_QUESTION_TYPE_MULTIPLE_CHOICE = 'multipleChoice';
export const SDC_QUESTION_TYPE_RADIO = 'radio';
export const SDC_QUESTION_TYPE_TRUE_FALSE = 'trueFalse';
export const SDC_QUESTION_TYPE_DECIMAL = 'decimal';
export const SDC_QUESTION_TYPE_INTEGER = 'integer';

export type DiagnosticProcedureID = string;
export type PatientID = string;
export type FormFillerID = string;
export type FormID = string;
export type FormName = string;
export type Version = string;
export type QuestionID = string;
export type FormResponseID = string;

interface SDCQuestionBase<T extends string> {
    QuestionID: QuestionID;
    QuestionString: string;
    QuestionType: T;
    enabledState: SDCAnswer['Answer'] | null;
    order: number;
    DependentQuestions: SDCQuestion[];
}

export interface SDCStringQuestion extends SDCQuestionBase<typeof SDC_QUESTION_TYPE_STRING> {}

export interface SDCDecimalQuestion extends SDCQuestionBase<typeof SDC_QUESTION_TYPE_DECIMAL> {}

export interface SDCIntegerQuestion extends SDCQuestionBase<typeof SDC_QUESTION_TYPE_INTEGER> {}

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
    [SDC_QUESTION_TYPE_DECIMAL]: SDCDecimalQuestion;
    [SDC_QUESTION_TYPE_INTEGER]: SDCIntegerQuestion;
};

export interface SDCSection {
    SectionTitle: string;
    Questions: SDCQuestion[];
}

export interface SDCForm {
    FormID: FormID;
    DiagnosticProcedureID: DiagnosticProcedureID;
    FormName: FormName;
    Version: Version;
    FormSections: SDCSection[];
}

interface SDCAnswerBase<T extends SDCQuestion['QuestionType'], A> {
    QuestionID: QuestionID;
    AnswerType: T;
    Answer: A | undefined;
}

export type SDCStringAnswer = SDCAnswerBase<typeof SDC_QUESTION_TYPE_STRING, string>;
export type SDCDecimalAnswer = SDCAnswerBase<typeof SDC_QUESTION_TYPE_DECIMAL, number>;
export type SDCIntegerAnswer = SDCAnswerBase<typeof SDC_QUESTION_TYPE_INTEGER, number>;
export type SDCMultipleChoiceAnswer = SDCAnswerBase<typeof SDC_QUESTION_TYPE_MULTIPLE_CHOICE, string[]>;
export type SDCRadioAnswer = SDCAnswerBase<typeof SDC_QUESTION_TYPE_RADIO, string>;
export type SDCTrueFalseAnswer = SDCAnswerBase<typeof SDC_QUESTION_TYPE_TRUE_FALSE, boolean>;

export type SDCAnswerTypes = {
    [SDC_QUESTION_TYPE_STRING]: SDCStringAnswer;
    [SDC_QUESTION_TYPE_MULTIPLE_CHOICE]: SDCMultipleChoiceAnswer;
    [SDC_QUESTION_TYPE_RADIO]: SDCRadioAnswer;
    [SDC_QUESTION_TYPE_TRUE_FALSE]: SDCTrueFalseAnswer;
    [SDC_QUESTION_TYPE_DECIMAL]: SDCDecimalAnswer;
    [SDC_QUESTION_TYPE_INTEGER]: SDCIntegerAnswer;
};

export type SDCAnswer = SDCAnswerTypes[keyof SDCAnswerTypes];

export interface SDCFormResponse {
    FormResponseID: FormResponseID;
    FormID: FormID;
    PatientID: PatientID;
    FormFillerID: FormFillerID;
    Answers: { [key: string]: SDCAnswer | null | undefined };
    IsDraft: boolean;
    Version: string;
}

export interface SDCFormResponseForSubmission extends Omit<SDCFormResponse, 'FormResponseID'> {
    FormResponseID?: string;
}

export interface SDCFormMetaData {
    FormID: FormID;
    DiagnosticProcedureID: DiagnosticProcedureID;
    FormName: FormName;
    Version: Version;
}

export interface SDCFormListResponse {
    items: SDCFormMetaData[];
    total: number;
}

export interface SDCFormResponseParams {
    FormName:FormName;
    FormFillerID: FormFillerID;
    DiagnosticProcedureID: DiagnosticProcedureID;  
    PatientID: PatientID;
    FormResponseID: FormResponseID;
}

export interface SDCFormResponseListResponse { 
    items: { form: SDCFormMetaData, 'form-response': SDCFormResponse }[], 
    total: number 
}

export interface SDCFormResponseListMetaData {     
    key: string,
    PatientID: string,
    FormID: string,
    Date: string,
    FormFillerID:string,
    ResponseID:string
}