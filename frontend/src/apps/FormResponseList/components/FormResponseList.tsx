
import React, { Component } from 'react';
import { NavLink, withRouter,RouteComponentProps } from 'react-router-dom';
import { Table, Input, Button, Space, message  } from 'antd';
import { getFormResponses } from "../repository"
import { SDCFormResponseListResponse,SDCFormResponseListMetaData, SDCFormResponseParams } from 'utils/sdcTypes';
import { getCurrentUser } from 'utils/user';
import { ColumnsType, ColumnType } from 'antd/lib/table';
import { SearchOutlined } from '@ant-design/icons';
import { type } from 'os';


export type Props = RouteComponentProps<{}>;

  
interface State {
    loading: boolean;
    formResponseList: SDCFormResponseListMetaData[];
    PatientID: string | null;
    FormID: string | null;
    FormName:string | null;
    FormFillerID:string | null;
    FormResponseID: string | null;
    DiagnosticProcedureID: string | null;
}

class FormResponseList extends Component<Props, State> {
    async componentDidMount() {
      await this.getResponses({
        FormName: null,
        FormFillerID: null,
        FormResponseID: null,
        PatientID: null,
        DiagnosticProcedureID: null
      });
    }

    state: State = {
      loading: true,
      formResponseList:[], 
      PatientID: null,
      FormID: null,
      FormName:null,
      FormFillerID:null,
      FormResponseID: null,
      DiagnosticProcedureID: null
    };
    

    getResponses = async (filters: SDCFormResponseParams) => {
      // await new Promise((res) => setTimeout(() => res(), 2000));

        try{
     
        const {PatientID, FormName, FormFillerID, FormResponseID, DiagnosticProcedureID} = filters;

      
        const response = await getFormResponses({PatientID, FormName, FormFillerID, FormResponseID, DiagnosticProcedureID});

        const data = response.items.map( formItem => {
          const { 'form-response': formResponse, form } = formItem;
          return {
            key: formResponse.FormResponseID,
            PatientID: formResponse.PatientID,
            FormID: formResponse.FormID,
            FormName:form.FormName,
            Date: "",
            FormFillerID:formResponse.FormFillerID,
            ResponseID: formResponse.FormResponseID
          }
        })

        this.setState({formResponseList:data,loading:false})
      }catch(e){
        message.error('Something went wrong! Please try again.');
      }
    } 

    getColumnSearchProps = (dataIndex: keyof SDCFormResponseParams): Partial<ColumnType<SDCFormResponseListMetaData>> => ({
      filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
        <div style={{ padding: 8 }}>
          <Input
            placeholder={`Search ${dataIndex}`}
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Space>
            <Button
              type="primary"
              onClick={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
              icon={<SearchOutlined />}
              size="small"
              style={{ width: 90 }}
            >
              Search
            </Button>
            <Button onClick={() => this.handleReset(clearFilters,dataIndex)} size="small" style={{ width: 90 }}>
              Reset
            </Button>
          </Space>
        </div>
      ),
      filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    });

    handleSearch = (selectedKeys: React.ReactText[], confirm: () => void, dataIndex: keyof SDCFormResponseParams) => {
      confirm();

      const newState = {
        ...this.state,
        [dataIndex]: selectedKeys[0]
      }
      this.setState(newState);

      this.getResponses(newState);
    };
  
    handleReset = (clearFilters: (() => void) | undefined, dataIndex: keyof SDCFormResponseParams) => {
      clearFilters?.();
      
      const newState = {
        ...this.state,
        [dataIndex]: null
      }

      this.setState(newState);
      this.getResponses(newState);
    };
    
    render() {
        const history = this.props.history;

        const columns: ColumnsType<SDCFormResponseListMetaData> = [
          {
            title: 'Patient Name',
            dataIndex: 'PatientID',
            key: 'PatientID',
            ...this.getColumnSearchProps('PatientID'),
          },
          {
            title: 'Procedure',
            dataIndex: 'FormID',
            key: 'FormID',
          },
          {
            title:'Form Name', 
            dataIndex: 'FormName',
            key:'FormName',
            ...this.getColumnSearchProps('FormName'),
          },
          {
            title: 'Date',
            dataIndex: 'date',
            key: 'date',
          },
          {
            title: 'Submitted by',
            dataIndex: 'FormFillerID',
            key: 'FormFillerID',
            ...this.getColumnSearchProps('FormFillerID'),
          }
        ];
    
        return (
            <>
            <h1>Responses</h1>
            < Table dataSource={this.state.formResponseList} columns={columns} loading={this.state.loading}
              onRow = { (record,rowIndex) => {
                return{ onClick: () => { history.push(`/${getCurrentUser().getID()}/responses/${record.ResponseID}`) } 
              }
              }}
            />
            </>
        );
    }
}

export default withRouter(FormResponseList);
