import React from 'react';
import styled from 'styled-components';
import { Input, Button, Spin, message, Pagination } from 'antd';
import { PlusCircleFilled } from '@ant-design/icons';
import { isEmpty } from 'lodash';

import FormCard from 'common/FormCard/FormCard';

import { DEFAULT_LIMIT } from '../constants';
import { searchMetaDataList } from '../repository';

import { SDCFormMetaData } from 'utils/sdcTypes';

import UploadFormModal from './UploadFormModal';

const SpinnerWrapper = styled.div`
    display: flex;
    justify-content: center;
`;

const Actions = styled.div`
    display: flex;
    justify-content: space-between;
    margin-bottom: 40px;
`;

const Search = styled(Input.Search)`
    max-width: 400px;
    margin-right: 20px;
`;

const Forms = styled.div`
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
`;

interface State {
    loading: boolean;
    formMetaDataList: SDCFormMetaData[];
    total: number;
    query: string;
    currentPage: number;
    openUploadFormModal: boolean;
    uploadingNewForm: boolean;
}

class FormList extends React.Component<{}, State> {
    async componentDidMount() {
        await this.onSearch(this.state.query, 1);
    }

    state: State = {
        loading: true,
        formMetaDataList: [],
        total: 0,
        query: '.*',
        currentPage: 1,
        openUploadFormModal: false,
        uploadingNewForm: true,
    };

    onSearch = async (text: string, page: number) => {
        try {
            this.setState({ loading: true, query: text });
            const { items, total } = await searchMetaDataList(isEmpty(text) ? '.*' : text, (page - 1) * DEFAULT_LIMIT);
            this.setState({ formMetaDataList: items, total, currentPage: page });
        } catch (e) {
            message.error('Something went wrong! Please try again.');
        }
        this.setState({ loading: false });
    };

    handlePageChange = async (page: number) => {
        const { query } = this.state;
        await this.onSearch(query, page);
    };

    handleUploadForm = (uploadingNewForm: boolean) => this.setState({openUploadFormModal: true, uploadingNewForm: uploadingNewForm});
    closeOpenUploadFormModal = () => this.setState({openUploadFormModal: false});
    onUploadComplete = async () => await this.onSearch(this.state.query, 1);

    renderForms = () => {
        const { formMetaDataList } = this.state;

        return (
            <Forms>
                {formMetaDataList.map((formMetaData, index) => (
                    <FormCard key={index} metaData={formMetaData} openUploadModal={() => this.handleUploadForm(false)} />
                ))}
            </Forms>
        );
    };

    render() {
        const { loading, total, currentPage, openUploadFormModal, uploadingNewForm } = this.state;
        return (
            <div data-testid="form-list-page">
                <Actions>
                    <Search
                        loading={loading}
                        placeholder="Search Forms"
                        onSearch={t => this.onSearch(t, 1)}
                        enterButton
                    />
                    <Button type="primary" icon={<PlusCircleFilled />} onClick={() => this.handleUploadForm(true)}>
                        Upload Form
                    </Button>
                </Actions>
                {loading ? (
                    <SpinnerWrapper>
                        <Spin />
                    </SpinnerWrapper>
                ) : (
                    <>
                        {this.renderForms()}
                        <Pagination
                            current={currentPage}
                            pageSize={DEFAULT_LIMIT}
                            total={total}
                            onChange={this.handlePageChange}
                        />
                    </>
                )}
                <UploadFormModal
                 open={openUploadFormModal} 
                 onClose={this.closeOpenUploadFormModal} 
                 isNewForm={uploadingNewForm}
                 onComplete={this.onUploadComplete}  />
            </div>
        );
    }
}

export default FormList;
