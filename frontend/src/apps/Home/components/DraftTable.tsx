import React from 'react';
import { useHistory } from 'react-router-dom';
import { Table } from 'antd';

import { SDCFormResponseListResponse } from 'utils/sdcTypes';

interface Props {
    drafts: SDCFormResponseListResponse;
}

const columns = [
    { title: 'Patient', dataIndex: 'patient', key: 'patient' },
    { title: 'Form', dataIndex: 'form', key: 'form' },
    { title: 'Procedure', dataIndex: 'procedure', key: 'procedure' },
    { title: 'Date', dataIndex: 'date', key: 'date' }
];

const DraftTable: React.FC<Props> = ({ drafts }) => {
    const history = useHistory();

    const data = drafts.items.map(({ 'form-response': formResponse, form }) => {
        return {
            key: formResponse.FormResponseID,
            formFiller: formResponse.FormFillerID,
            patient: formResponse.PatientID,
            form: form.FormName,
            procedure: form.DiagnosticProcedureID,
            date: '2020-01-01' // TODO: Replace with correct date
        };
    });

    return (
        <Table
            onRow={(record, rowIndex) => {
                return {
                    onClick: () => history.push(`/${record.formFiller}/responses/${record.key}`)
                };
            }}
            dataSource={data}
            columns={columns}
            pagination={{ hideOnSinglePage: true }}
        />
    );
};

export default DraftTable;
