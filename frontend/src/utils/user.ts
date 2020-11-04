class User {
    private _ID: string;

    constructor(id: string) {
        this._ID = id;
    }
    getID = (): string => this._ID;
    setID = (id: string) => (this._ID = id);
}

let currentUser: User;
export const getCurrentUser = () => currentUser;
export const setCurrentUser = (id: string) => currentUser = new User(id);
