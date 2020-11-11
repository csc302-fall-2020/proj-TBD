import React from 'react';
import styled from 'styled-components';
import { Input, Button, Spin, message } from 'antd';
import { PlusCircleFilled } from '@ant-design/icons';
import { isEmpty } from 'lodash';

import FormCard from 'common/FormCard/FormCard';

import { searchMetaDataList } from '../repository';

import { SDCFormMetaData } from 'utils/sdcTypes';

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
    formMetaDataList: Array<SDCFormMetaData>;
}

class FormList extends React.Component<{}, State> {
    async componentDidMount() {
        await this.onSearch('.*');
    }

    state: State = {
        loading: true,
        formMetaDataList: []
    };

    onSearch = async (text: string) => {
        try {
            this.setState({ loading: true });
            const formMetaDataList = await searchMetaDataList(isEmpty(text) ? '.*' : text);
            this.setState({ formMetaDataList });
        } catch (e) {
            message.error('Something went wrong! Please try again.');
        }
        this.setState({ loading: false });
    };

    handleUploadForm = () => {};

    renderForms = () => {
        const { formMetaDataList } = this.state;

        return (
            <Forms>
                {formMetaDataList.map((formMetaData, index) => (
                    <FormCard key={index} metaData={formMetaData} />
                ))}
            </Forms>
        );
    };

    render() {
        const { loading } = this.state;
        return (
            <div data-testid="form-list-page">
                <Actions>
                    <Search loading={loading} placeholder="Search Forms" onSearch={this.onSearch} enterButton />
                    <Button type="primary" icon={<PlusCircleFilled />} onClick={this.handleUploadForm}>
                        Upload Form
                    </Button>
                </Actions>
                {loading ? (
                    <SpinnerWrapper>
                        <Spin />
                    </SpinnerWrapper>
                ) : (
                    this.renderForms()
                )}
            </div>
        );
    }
}

export default FormList;
