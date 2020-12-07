import React from 'react';
import { SDCClinician } from 'utils/sdcTypes';
import { UserProps } from 'common/AuthProvider/AuthProvider';


jest.mock('common/AuthProvider/AuthProvider', () => ({
    useUser: jest.fn(
        (): SDCClinician => ({
            FormFillerID: '1',
            FirstName: 'John',
            LastName: 'Doe'
        })
    ),

    withUser: jest.fn(
        <P extends object>(Component: React.ComponentType<P>): React.ComponentType<P & UserProps> => (props) => <Component {...props} user={{
            FormFillerID: '1',
            FirstName: 'John',
            LastName: 'Doe'
        }}/>
    )
}));




export {};
