import ApiTester from 'ApiTester';
import React from 'react';
import { HashRouter, Route } from 'react-router-dom'
import './App.css';

function App() {
    return (<HashRouter>
        <Route path='/test'>
            <ApiTester defaultRoute='test' />
        </Route>
        <Route path='/'>
            <div className="App">
                <header className="App-header">
                    <p>
                        Edit <code>src/App.tsx</code> and save to reload.
                </p>
                    <a className="App-link" href="https://reactjs.org" target="_blank" rel="noopener noreferrer">
                        Learn React
                </a>
                </header>
            </div>
        </Route>
    </HashRouter>);
}

export default App;
