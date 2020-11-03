import React from 'react';
import { Menu, Typography } from 'antd';
import { useHistory, useParams } from 'react-router-dom';
import styled from 'styled-components';

const { Text } = Typography;

const Header = styled.div`
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #f0f0f0;
`;

const StyledMenu = styled(Menu)`
    border: none;
`;

type Tab = { tabName: string; route: string };
type Props = { indexSelected: number; tabs: Array<Tab> };
type ParamTypes = { clinicianID: string };

const NavBar: React.FC<Props> = ({ indexSelected, tabs, children }) => {
    const selectedRoute = tabs[indexSelected].route;
    const history = useHistory();
    const { clinicianID } = useParams<ParamTypes>();

    return (
        <div>
            <Header>
                <Text>Hello, Dr.</Text>
                <StyledMenu
                    mode="horizontal"
                    selectedKeys={[selectedRoute]}
                    onClick={({ key: route }) => history.push(`/${clinicianID}${route}`)}
                >
                    {tabs.map(({ tabName, route }) => (
                        <Menu.Item key={route}>{tabName}</Menu.Item>
                    ))}
                </StyledMenu>
            </Header>
            {children}
        </div>
    );
};

export default NavBar;
