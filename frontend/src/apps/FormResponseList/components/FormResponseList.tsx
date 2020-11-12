
import React, { Component } from 'react';
import { NavLink, withRouter,RouteComponentProps } from 'react-router-dom';
import { Table } from 'antd';
import { getFormResponses } from "../repository"
import { SDCFormResponseListResponse,SDCFormResponseListMetaData } from 'utils/sdcTypes';
import { getCurrentUser } from 'utils/user';
import { ColumnsType } from 'antd/lib/table';


export type Props = RouteComponentProps<{}>;

  const columns: ColumnsType<SDCFormResponseListMetaData> = [
    {
      title: 'Patient Name',
      dataIndex: 'PatientID',
      key: 'PatientID',
    },
    {
      title: 'Procedure',
      dataIndex: 'FormID',
      key: 'FormID',
    },
    {
      title:'Form Name',
      dataIndex: 'FormName',
      key:'FormName'
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
    }
  ];

interface State {
    loading: boolean;
    formResponseList: SDCFormResponseListMetaData[];
}

class FormResponseList extends Component<Props, State> {
    async componentDidMount() {
      await this.getResponses();
    }

    state: State = {
      loading: true,
      formResponseList:[]
    };

    getResponses = async () => {
      // await new Promise((res) => setTimeout(() => res(), 2000));
      const response = await getFormResponses();

      const data = response.items.map( formItem => {
        return {
          key: formItem["form-response"].FormResponseID,
          PatientID: formItem["form-response"].PatientID,
          FormID: formItem["form-response"].FormID,
          FormName:formItem["form"].FormName,
          Date: "",
          FormFillerID:formItem["form-response"].FormFillerID,
          ResponseID: formItem["form-response"].FormResponseID
        }
      })
      console.log(response);
      this.setState({formResponseList:data,loading:false})
    } 
    
    render() {
        const history = this.props.history;
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
