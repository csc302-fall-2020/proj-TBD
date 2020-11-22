import React, { Component } from 'react';
import { withRouter, RouteComponentProps } from 'react-router-dom';
import { Table, Input, Button, Space, message, DatePicker } from 'antd';
import moment from 'moment';
import { getFormResponses } from '../repository';
import { SDCFormResponseListMetaData, SDCClinician } from 'utils/sdcTypes';
import { ColumnsType, ColumnType } from 'antd/lib/table';
import { FilterDropdownProps } from 'antd/lib/table/interface';
import { SearchOutlined } from '@ant-design/icons';
import { withUser } from 'common/AuthProvider/AuthProvider';
import { DEFAULT_LIMIT } from '../constants';

export type Props = RouteComponentProps<{}> & { user: SDCClinician };

type TextSearchIndex = 'PatientID' | 'DiagnosticProcedureID' | 'FormName' | 'FormFillerID';

interface State {
    loading: boolean;
    total: number;
    page: number;
    formResponseList: SDCFormResponseListMetaData[];
    PatientID: string | null;
    FormID: string | null;
    FormName: string | null;
    FormFillerID: string | null;
    FormResponseID: string | null;
    DiagnosticProcedureID: string | null;
    StartTime: moment.Moment | null;
    EndTime: moment.Moment | null;
}

class FormResponseList extends Component<Props, State> {
    async componentDidMount() {
        await this.getResponses();
    }

    state: State = {
        loading: true,
        total: 0,
        page: 1,
        formResponseList: [],
        PatientID: null,
        FormID: null,
        FormName: null,
        FormFillerID: null,
        FormResponseID: null,
        DiagnosticProcedureID: null,
        StartTime: null,
        EndTime: null
    };

    getResponses = async () => {
        try {
            const {
                PatientID,
                FormName,
                FormFillerID,
                FormResponseID,
                DiagnosticProcedureID,
                StartTime,
                EndTime,
                page
            } = this.state;

            const response = await getFormResponses({
                PatientID,
                FormName,
                FormFillerID,
                FormResponseID,
                DiagnosticProcedureID,
                StartTime: StartTime?.toISOString() ?? null,
                EndTime: EndTime?.toISOString() ?? null,
                offset: (page - 1) * DEFAULT_LIMIT
            });
            const data = response.items.map(formItem => {
                const { 'form-response': formResponse, form } = formItem;
                return {
                    key: formResponse.FormResponseID,
                    PatientID: formResponse.PatientID,
                    FormID: formResponse.FormID,
                    DiagnosticProcedureID: form.DiagnosticProcedureID,
                    FormName: form.FormName,
                    CreateTime: moment(formResponse.CreateTime).format('YYYY-MM-DD'),
                    FormFillerID: formResponse.FormFillerID,
                    ResponseID: formResponse.FormResponseID
                };
            });

            this.setState({ formResponseList: data, loading: false, total: response.total });
        } catch (e) {
            message.error('Something went wrong! Please try again.');
        }
    };

    getTextSearchProps = (textSearchIndex: TextSearchIndex): Partial<ColumnType<SDCFormResponseListMetaData>> => {
        const textInputSearch = (filterDropdownProps: FilterDropdownProps) => {
            const { confirm } = filterDropdownProps;
            const { [textSearchIndex]: value } = this.state;
            return (
                <Input
                    placeholder={`Search ${textSearchIndex}`}
                    value={value ?? ""}
                    onChange={e => this.setState({ ...this.state, [textSearchIndex]: e.target.value })}
                    onPressEnter={() => this.handleSearch(confirm)}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                />
            );
        };

        const resetText = () => {
            this.setState({ ...this.state, [textSearchIndex]: null }, () => this.getResponses());
        };

        return this.getSearchProps(textInputSearch, resetText);
    };

    getDateSearchProps = (): Partial<ColumnType<SDCFormResponseListMetaData>> => {
        const dateInputSearch = () => {
            const { StartTime, EndTime } = this.state;

            return (
                <DatePicker.RangePicker
                    value={[StartTime, EndTime]}
                    onCalendarChange={(dates) => {
                        const getDate = (date: moment.Moment | null) => {
                            if (!date) return null;

                            date.set({hour: 0, minute: 0, second: 0, millisecond: 0});
                            return date;
                        }

                        this.setState({ StartTime: dates ? getDate(dates[0]) : null, EndTime: dates ? getDate(dates[1]) : null });
                    }}
                    style={{ marginRight: 8 }}
                />
            );
        };

        const resetDate = () => {
            this.setState({ ...this.state, StartTime: null, EndTime: null }, () => this.getResponses());
        };

        return this.getSearchProps(dateInputSearch, resetDate);
    };

    getSearchProps = (
        searchComponent: Function,
        handleReset: Function
    ): Partial<ColumnType<SDCFormResponseListMetaData>> => ({
        filterDropdown: ({ confirm }) => (
            <div style={{ padding: 8 }}>
                {searchComponent({ confirm })}
                <Space>
                    <Button
                        type="primary"
                        onClick={() => this.handleSearch(confirm)}
                        icon={<SearchOutlined />}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Search
                    </Button>
                    <Button onClick={() => handleReset()} size="small" style={{ width: 90 }}>
                        Reset
                    </Button>
                </Space>
            </div>
        ),
        filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />
    });

    handleSearch = async (confirm: () => void) => {
        confirm();

        this.getResponses();
    };

    handlePageChange = async (page: number) => {
        await this.setState({ page });
        this.getResponses();
    };

    render() {
        const { total } = this.state;
        const history = this.props.history;

        const columns: ColumnsType<SDCFormResponseListMetaData> = [
            {
                title: 'Patient Name',
                dataIndex: 'PatientID',
                key: 'PatientID',
                ...this.getTextSearchProps('PatientID')
            },
            {
                title: 'Procedure',
                dataIndex: 'DiagnosticProcedureID',
                key: 'DiagnosticProcedureID'
            },
            {
                title: 'Form Name',
                dataIndex: 'FormName',
                key: 'FormName',
                ...this.getTextSearchProps('FormName')
            },
            {
                title: 'Date',
                dataIndex: 'CreateTime',
                key: 'CreateTime',
                ...this.getDateSearchProps()
            },
            {
                title: 'Submitted by',
                dataIndex: 'FormFillerID',
                key: 'FormFillerID',
                ...this.getTextSearchProps('FormFillerID')
            }
        ];

        return (
            <>
                <h1>Responses</h1>
                <Table
                    dataSource={this.state.formResponseList}
                    columns={columns}
                    loading={this.state.loading}
                    onRow={(record, rowIndex) => {
                        return {
                            onClick: () => {
                                history.push(`/${this.props.user.FormFillerID}/responses/${record.ResponseID}`);
                            }
                        };
                    }}
                    pagination={{
                        onChange: this.handlePageChange,
                        pageSize: DEFAULT_LIMIT,
                        total
                    }}
                />
            </>
        );
    }
}

export default withUser(withRouter(FormResponseList));
