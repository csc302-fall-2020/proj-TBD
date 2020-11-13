import React, { useContext, useEffect, useState } from 'react';
import { NavLink, useParams } from 'react-router-dom';
import { Alert, Button, Space, Spin } from 'antd';
import { SDCClinician } from 'utils/sdcTypes';
import { getUser } from './repository';
import styled from 'styled-components';
import { LoginOutlined } from '@ant-design/icons';

export const UserContext = React.createContext<SDCClinician>((undefined as unknown) as SDCClinician);

const CenteredWrapper = styled.div`
    display: flex;
    align-items: center;
    justify-content: center;
    height: 100vh;
`;

type Params = {
    clinicianID: string;
};

export const useUser = () => useContext(UserContext);

const AuthProvider: React.FC = ({ children }) => {
    const { clinicianID } = useParams<Params>();

    const [user, setUser] = useState<SDCClinician | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setUser(null);

        const getClinician = async () => {
            try {
                const user = await getUser(clinicianID);

                setUser(user);
            } catch (e) {
                setError(e);
            }
        };

        getClinician();
    }, [clinicianID]);

    if (user) {
        return <UserContext.Provider value={user}>{children}</UserContext.Provider>;
    }

    return (
        <CenteredWrapper>
            {error ? (
                <Space direction={'vertical'} align={'center'} size={'large'}>
                    <Alert showIcon message={"We couldn't find a clinician with that ID"} type={'error'} />
                    <NavLink to={'/'}>
                        <Button type={'primary'} icon={<LoginOutlined />}>
                            Back to Login
                        </Button>
                    </NavLink>
                </Space>
            ) : (
                <Spin />
            )}
        </CenteredWrapper>
    );
};

export const withUser = <P extends object>(Component: React.ComponentType<P & UserProps>) =>
    class WithUser extends React.Component<P> {
        render() {
            return <UserContext.Consumer>{(user) => <Component {...this.props} user={user} />}</UserContext.Consumer>;
        }
    };

export type UserProps = { user: SDCClinician };

export default AuthProvider;
