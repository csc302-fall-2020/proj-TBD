import React from 'react';
import { useHistory } from 'react-router-dom';
import { Table } from 'antd';
import moment from 'moment';

import { SDCFormResponseListResponse } from 'utils/sdcTypes';

const _renderField = (text: string) => {
    return {
        props: { style: { cursor: 'pointer' } },
        children: <div>{text}</div>
    };
};

interface Props {
    drafts: SDCFormResponseListResponse;
}

const columns = [
    { title: 'Patient', dataIndex: 'patient', key: 'patient', render: _renderField },
    { title: 'Form', dataIndex: 'form', key: 'form', render: _renderField },
    { title: 'Procedure', dataIndex: 'procedure', key: 'procedure', render: _renderField },
    { title: 'Date', dataIndex: 'date', key: 'date', render: _renderField }
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
            date: moment(formResponse.CreateTime).format('YYYY-MM-DD')
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
