import { SDCClinician } from 'utils/sdcTypes';

jest.mock('common/AuthProvider/AuthProvider', () => ({
    useUser: jest.fn(
        (): SDCClinician => ({
            FormFillerID: '1',
            FirstName: 'John',
            LastName: 'Doe'
        })
    )
}));

export {};
