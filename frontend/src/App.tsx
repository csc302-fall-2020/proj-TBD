import ApiTester from 'ApiTester';
import React from 'react';
import { HashRouter, Route, Switch } from 'react-router-dom';
import './App.css';

import Home from 'apps/Home';
import FormList from 'apps/FormList';
import Form from 'apps/Form';
import Login from 'apps/Login';
import Search from 'apps/Search';

import NavBar from 'common/NavBar';

const tabs = [
    { tabName: 'Home', route: '/home' },
    { tabName: 'Forms', route: '/forms' },
    { tabName: 'Search', route: '/search' }
];

function App() {
    return (
        <HashRouter>
            <Switch>
                <Route path="/test">
                    <ApiTester defaultRoute="test" />
                </Route>
                <Route exact path="/" component={Login} />
                <Route
                    exact
                    path="/:clinicianID/home"
                    children={
                        <NavBar indexSelected={0} tabs={tabs}>
                            <Home />
                        </NavBar>
                    }
                />
                <Route
                    exact
                    path="/:clinicianID/forms"
                    children={
                        <NavBar indexSelected={1} tabs={tabs}>
                            <FormList />
                        </NavBar>
                    }
                />
                <Route
                    exact
                    path="/:clinicianID/forms/:formID"
                    children={
                        <NavBar indexSelected={1} tabs={tabs}>
                            <Form />
                        </NavBar>
                    }
                />
                <Route
                    exact
                    path="/:clinicianID/search"
                    children={
                        <NavBar indexSelected={2} tabs={tabs}>
                            <Search />
                        </NavBar>
                    }
                />
            </Switch>
        </HashRouter>
    );
}

export default App;
