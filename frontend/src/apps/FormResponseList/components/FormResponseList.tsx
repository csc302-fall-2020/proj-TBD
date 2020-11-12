
import React, { Component } from 'react';
import {NavLink} from 'react-router-dom';
import { Table } from 'antd';
import { getFormResponses } from "../repository"
import { SDCFormResponseListResponse,SDCFormResponseListMetaData } from 'utils/sdcTypes';
import { getCurrentUser } from 'utils/user';
import { ColumnsType } from 'antd/lib/table';

export type Props = {};

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
      title: 'Date',
      dataIndex: 'date',
      key: 'date',
    },
    {
      title: 'Submitted by',
      dataIndex: 'FormFillerID',
      key: 'FormFillerID',
    },
    {
      title: 'Action',
      dataIndex: '',
      key: '',
      render: (responseID, response) => <NavLink to={`/${getCurrentUser().getID()}/responses/${response.ResponseID}`} >Open</NavLink>,
    }
  ];

interface State {
    loading: boolean;
    formResponseList: SDCFormResponseListMetaData[];
}

class FormResponseList extends Component<{}, State> {
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
          Date: "",
          FormFillerID:formItem["form-response"].FormFillerID,
          ResponseID: formItem["form-response"].FormResponseID
        }
      })
      
      this.setState({formResponseList:data,loading:false})
    } 
    
    render() {
        return (
            <>
            <h1>Responses</h1>
            <Table dataSource={this.state.formResponseList} columns={columns} loading={this.state.loading}/>
            </>
        );
    }
}

export default FormResponseList;

