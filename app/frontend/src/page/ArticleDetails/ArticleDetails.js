import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './ArticleDetails.css';

const API_URL = 'http://localhost:5000';

function ArticleDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({});

    useEffect(() => {
        axios.get(`${API_URL}/articles/${id}`)
            .then(response => {
                setArticle(response.data);
                setFormData(response.data);
            })
            .catch(error => console.error('Ошибка загрузки статьи:', error));
    }, [id]);

    // Обновление статьи
    const updateArticle = () => {
        axios.put(`${API_URL}/articles/${id}`, formData)
            .then(() => {
                alert('Статья обновлена');
                setIsEditing(false);
                navigate('/'); // Возвращаемся на главную страницу
            })
            .catch(error => console.error('Ошибка обновления статьи:', error));
    };

    if (!article) return <p>Загрузка статьи...</p>;

    return (
        <div className="article-details">
            {isEditing ? (
                <div>
                    <h2>Редактировать статью</h2>
                    <input
                        type="text"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        placeholder="Заголовок"
                    />
                    <textarea
                        value={formData.text}
                        onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                        placeholder="Текст статьи"
                    ></textarea>
                    <button onClick={updateArticle}>Сохранить</button>
                    <button onClick={() => setIsEditing(false)}>Отмена</button>
                </div>
            ) : (
                <div>
                    <h2>{article.title}</h2>
                    <p><strong>Автор:</strong> {article.author || 'Не указан'}</p>
                    <p><strong>Дата:</strong> {new Date(article.date).toLocaleDateString('ru-RU')}</p>
                    <p><strong>Теги:</strong> {article.tags?.join(', ') || 'Нет'}</p>
                    <p><strong>Текст:</strong> {article.text}</p>
                    <a href={article.href} target="_blank" rel="noopener noreferrer">
                        Перейти к статье
                    </a>
                    <button onClick={() => setIsEditing(true)}>Редактировать</button>
                </div>
            )}
        </div>
    );
}

export default ArticleDetails;
