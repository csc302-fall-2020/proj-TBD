import React from 'react';
import { Menu, Typography } from 'antd';
import { useParams, NavLink } from 'react-router-dom';
import styled from 'styled-components';

import { getCurrentUser, setCurrentUser } from 'utils/user';

const { Text } = Typography;

const Header = styled.div`
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    justify-content: center;
`;

const InnerWrapper = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    max-width: 1000px;
    width: 100%;
    margin: 0 20px 0 20px;
`;

const StyledMenu = styled(Menu)`
    border: none;
`;

const PageWrapper = styled.div`
    display: flex;
    justify-content: center;
`;

const InnerPageWrapper = styled.div`
    max-width: 1000px;
    width: 100%;
    margin: 20px;
`;

type Tab = { tabName: string; route: string };
type Props = { indexSelected: number; tabs: Array<Tab> };
type ParamTypes = { clinicianID: string };

const NavBar: React.FC<Props> = ({ indexSelected, tabs, children }) => {
    const selectedRoute = tabs[indexSelected].route;
    const { clinicianID } = useParams<ParamTypes>();
    handleSetCurrentUser(clinicianID);

    return (
        <div data-testid="nav-bar">
            <Header>
                <InnerWrapper>
                    <Text>Hello, Dr.</Text>
                    <StyledMenu mode="horizontal" selectedKeys={[selectedRoute]}>
                        {tabs.map(({ tabName, route }) => (
                            <Menu.Item key={route}>
                                <NavLink to={`/${clinicianID}${route}`} data-testid={tabName}>
                                    {tabName}
                                </NavLink>
                            </Menu.Item>
                        ))}
                    </StyledMenu>
                </InnerWrapper>
            </Header>
            <PageWrapper>
                <InnerPageWrapper>{children}</InnerPageWrapper>
            </PageWrapper>
        </div>
    );
};

const handleSetCurrentUser = (clinicianID: string) => {
    const currentUser = getCurrentUser();
    if (currentUser) {
        if (currentUser.getID() !== clinicianID) currentUser.setID(clinicianID);
    } else {
        setCurrentUser(clinicianID);
    }
};

export default NavBar;
