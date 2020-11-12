import React, { useState, useEffect } from 'react';
import { useParams, NavLink } from 'react-router-dom';
import { Alert, Spin, Button } from 'antd';
import styled from 'styled-components';

import DraftTable from './DraftTable';

import FormCard from 'common/FormCard/FormCard';

import { getHomeData } from '../repository';

import { HomePageResponse, SDCFormMetaData, SDCFormResponseListResponse } from 'utils/sdcTypes';

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

export type Props = {};

type Params = { clinicianID: string };

const Home: React.FC<Props> = () => {
    const { clinicianID } = useParams<Params>();

    const [data, setData] = useState<HomePageResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHomeData = async () => {
            setError(null);

            try {
                const data = await getHomeData(clinicianID);
                setData(data);
            } catch (e) {
                setError(e.message);
            }
        };

        fetchHomeData();
    }, []);

    const renderForms = (forms: SDCFormMetaData[]) => (
        <Section>
            <FormsHeader>
                <h2>Start a new form</h2>
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

    const renderDrafts = (drafts: SDCFormResponseListResponse) => (
        <Section>
            <h2>My Drafts</h2>
            <DraftTable drafts={drafts} />
        </Section>
    );

    if (error) {
        return <Alert showIcon type={'error'} message={error} />;
    }

    if (data) {
        return (
            <div data-testid="home-page">
                {renderForms(data['most-used'])}
                {renderDrafts(data.drafts)}
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
