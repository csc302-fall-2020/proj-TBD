import ApiTester from 'ApiTester';
import React from 'react';
import { Route, Switch } from 'react-router-dom';

import Home from 'apps/Home';
import FormList from 'apps/FormList';
import Form from 'apps/Form';
import Login from 'apps/Login';
import FormResponseList from 'apps/FormResponseList';
import { FormFillerFormResponse, FormReceiverFormResponse } from './apps/FormResponse';

import NavBar from 'common/NavBar';
import AuthProvider from 'common/AuthProvider/AuthProvider';

const tabs = [
    { tabName: 'Home', route: '/home' },
    { tabName: 'Forms', route: '/forms' },
    { tabName: 'Responses', route: '/responses' }
];

function AppRouter() {
    return (
        <Switch>
            <Route path="/test">
                <ApiTester defaultRoute="test" />
            </Route>
            <Route exact path="/" component={Login} />
            <Route exact path="/responses/:responseID" children={<FormReceiverFormResponse />} />
            <Route exact path="/forms/:formID" children={<Login />} />
            <Route path={'/:clinicianID'}>
                <AuthProvider>
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
                        path="/:clinicianID/responses"
                        children={
                            <NavBar indexSelected={2} tabs={tabs}>
                                <FormResponseList />
                            </NavBar>
                        }
                    />
                    <Route
                        exact
                        path="/:clinicianID/responses/:responseID"
                        children={
                            <NavBar indexSelected={2} tabs={tabs}>
                                <FormFillerFormResponse />
                            </NavBar>
                        }
                    />
                </AuthProvider>
            </Route>
        </Switch>
    );
}

export default AppRouter;
