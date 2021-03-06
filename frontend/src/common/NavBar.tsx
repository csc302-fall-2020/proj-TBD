import React from 'react';
import { Menu, Typography } from 'antd';
import { NavLink } from 'react-router-dom';
import styled from 'styled-components';

import { useUser } from './AuthProvider/AuthProvider';

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
    padding: 20px;
`;

type Tab = { tabName: string; route: string };
type Props = { indexSelected: number; tabs: Array<Tab> };

const NavBar: React.FC<Props> = ({ indexSelected, tabs, children }) => {
    const selectedRoute = tabs[indexSelected].route;
    const user = useUser();

    return (
        <div data-testid="nav-bar">
            <Header>
                <InnerWrapper>
                    <Text>Hello, Dr. {user.LastName}</Text>
                    <StyledMenu mode="horizontal" selectedKeys={[selectedRoute]}>
                        {tabs.map(({ tabName, route }) => (
                            <Menu.Item key={route}>
                                <NavLink to={`/${user.FormFillerID}${route}`} data-testid={tabName}>
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

export default NavBar;
