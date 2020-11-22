import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import { Alert, Spin, Button } from 'antd';
import styled from 'styled-components';

import DraftTable from './DraftTable';

import FormCard from 'common/FormCard/FormCard';

import { getHomeData } from '../repository';

import { HomePageResponse, SDCFormMetaData, SDCFormResponseListResponse } from 'utils/sdcTypes';
import { useUser } from 'common/AuthProvider/AuthProvider';

const LoadingWrapper = styled.div`
    display: flex;
    justify-content: center;
`;

const Section = styled.div`
    margin-bottom: 40px;
`;

const FormsHeader = styled.div`
    display: flex;
    justify-content: space-between;
    flex-direction: row;
`;

const FormsWrapper = styled.div`
    display: flex;
    flex-direction: row;
    overflow-x: scroll;

    /* HIDE SCROLL BAR */
    ::-webkit-scrollbar {
        /* Chrome, Safari and Opera */
        display: none;
    }
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
`;

const _renderForms = (clinicianID: string, forms: SDCFormMetaData[]) => (
        <Section>
            <FormsHeader>
                <h2>Start a New Form</h2>
                <NavLink to={`/${clinicianID}/forms`}>
                    <Button type="link">more forms</Button>
                </NavLink>
            </FormsHeader>
            <FormsWrapper>
                {forms.map(metaData => {
                    return <FormCard metaData={metaData} hasActions={false} />;
                })}
            </FormsWrapper>
        </Section>
    );

const _renderDrafts = (drafts: SDCFormResponseListResponse) => (
    <Section>
        <h2>My Drafts</h2>
        <DraftTable drafts={drafts} />
    </Section>
);

export type Props = {};

const Home: React.FC<Props> = () => {
    const { FormFillerID } = useUser();

    const [data, setData] = useState<HomePageResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHomeData = async () => {
            setError(null);

            try {
                const data = await getHomeData(FormFillerID);
                setData(data);
            } catch (e) {
                setError(e.message);
            }
        };

        fetchHomeData();
    }, []);

    if (error) {
        return <Alert showIcon type={'error'} message={error} />;
    }

    if (data) {
        return (
            <div data-testid="home-page">
                {_renderForms(FormFillerID, data['most-used'])}
                {_renderDrafts(data.drafts)}
            </div>
        );
    }

    return (
        <LoadingWrapper>
            <Spin />
        </LoadingWrapper>
    );
};

export default Home;
