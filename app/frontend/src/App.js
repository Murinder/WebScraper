import React from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import ArticlesList from './page/ArticlesList/ArticlesList.js';
import ArticleDetails from './page/ArticleDetails/ArticleDetails.js';
import CreateArticle from './page/CreateArticle/CreateArticle.js';
import Analytics from './page/Analitycs/Analytics.js';
import ServerInfo from './page/ServerInfo/ServerInfo.js';


function App() {
    return (
        <Router>
            <div className="App">
                <nav>
                    <Link to="/">Список статей</Link>
                    <Link to="/analytics">Аналитика</Link>
                    <Link to="/server">Информация о сервере</Link>
                </nav>

                <Routes>
                    <Route path="/" element={<ArticlesList/>}/>
                    <Route path="/articles/:id" element={<ArticleDetails />} />
                    <Route path="/create" element={<CreateArticle />} />
                    <Route path="/analytics" element={<Analytics />} />
                    <Route path="/server" element={<ServerInfo />} /> {/* Новый маршрут */}
                </Routes>
            </div>
        </Router>
    );
}

export default App;
