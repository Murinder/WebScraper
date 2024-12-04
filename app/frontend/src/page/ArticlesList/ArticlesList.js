import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './ArticlesList.css';

const API_URL = 'http://localhost:5000';

function ArticlesList() {
    const [articles, setArticles] = useState([]);
    const [sortBy, setSortBy] = useState(''); // Состояние для сортировки
    const [order, setOrder] = useState('');
    const [filterByTitle, setFilterByTitle] = useState(''); // Добавлен фильтр по названию

    // Функция для загрузки статей с параметрами сортировки и фильтрации
    const fetchArticles = async () => {
        try {
            const params = {};
            if (sortBy) params.sortBy = sortBy;
            if (order) params.order = order;
            if (filterByTitle) {
                params.filterBy = 'title';
                params.filterValue = filterByTitle; // Добавлен фильтр по названию
            }

            const response = await axios.get(`${API_URL}/articles`, { params });
            setArticles(response.data);
        } catch (error) {
            console.error('Ошибка загрузки статей:', error);
        }
    };

    // Загружаем статьи при изменении параметров
    useEffect(() => {
        fetchArticles();
    }, [sortBy, order, filterByTitle]);

    // Удаление статьи
    const deleteArticle = (id) => {
        axios
            .delete(`${API_URL}/articles/${id}`)
            .then(() => {
                alert('Статья удалена');
                fetchArticles(); // Обновляем список статей
            })
            .catch((error) => console.error('Ошибка удаления статьи:', error));
    };

    return (
        <div>
            <h1>Список статей</h1>

            {/* Фильтрация и сортировка */}
            <div className="filters">

                <div>
                    <label htmlFor="filterTitle">Фильтрация по названию:</label>
                    <input
                        type="text"
                        id="filterTitle"
                        value={filterByTitle}
                        onChange={(e) => setFilterByTitle(e.target.value)}
                        placeholder="Введите название статьи"
                    />
                </div>

                <div>
                    <label htmlFor="sortBy">Сортировать по:</label>
                    <select
                        id="sortBy"
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value)}
                    >
                        <option value="">Не сортировать</option>
                        <option value="title">Названию</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="order">Порядок:</label>
                    <select
                        id="order"
                        value={order}
                        onChange={(e) => setOrder(e.target.value)}
                    >
                        <option value="">По возрастанию</option>
                        <option value="desc">По убыванию</option>
                    </select>
                </div>
            </div>

            <button>
                <Link to="/create">Создать статью</Link>
            </button>

            {/* Список статей */}
            <ul className="article-list">
                {articles.map((article) => (
                    <li key={article.id}>
                        <Link to={`/articles/${article.id}`}>{article.title}</Link>
                        <button
                            onClick={() => deleteArticle(article.id)}
                            className="delete-btn"
                        >
                            Удалить
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default ArticlesList;
