import React from 'react';
import { HashRouter } from 'react-router-dom';
import './App.css';

import AppRouter from './AppRouter';

function App() {
    return (
        <HashRouter>
            <AppRouter />
        </HashRouter>
    );
}

export default App;
