import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Alert } from 'antd';
import styled from 'styled-components';

import { getHomeData } from '../repository';

export type Props = {};

type Params = { clinicianID: string };

const Home: React.FC<Props> = () => {
    const { clinicianID } = useParams<Params>();

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchHomeData = async () => {
            setError(null);

            try {
                const data = await getHomeData(clinicianID);
            } catch (e) {
                setError(e.message);
            }
        };

        fetchHomeData();
    }, []);

    if (error) {
        return <Alert showIcon type={'error'} message={error} />;
    }

    return <div data-testid="home-page">Home Page</div>;
};

export default Home;
