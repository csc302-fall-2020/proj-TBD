import React from 'react';
import styled from 'styled-components';
import { Input, Button, Spin } from 'antd';
import { PlusCircleFilled } from '@ant-design/icons';

import FormCard from 'common/FormCard/FormCard';

import { getFormMetaDataList } from '../repository';

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
        const formMetaDataList = await getFormMetaDataList({});
        this.setState({ loading: false, formMetaDataList });
    }

    state: State = {
        loading: true,
        formMetaDataList: []
    };

    onSearch = () => {};

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
        return loading ? (
            <SpinnerWrapper>
                <Spin />
            </SpinnerWrapper>
        ) : (
            <div data-testid="form-list-page">
                <Actions>
                    <Search placeholder="Search Forms" onSearch={this.onSearch} enterButton />
                    <Button type="primary" icon={<PlusCircleFilled />} onClick={this.handleUploadForm}>
                        Upload Form
                    </Button>
                </Actions>
                {this.renderForms()}
            </div>
        );
    }
}

export default FormList;
