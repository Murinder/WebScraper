import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CreateArticle.css';

const API_URL = 'http://localhost:5000';

function CreateArticle() {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        title: '',
        author: '',
        date: '',
        text: '',
        href: '',
        tags: '',
    });

    // Функция обработки изменений в полях формы
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    // Функция отправки данных
    const handleSubmit = (e) => {
        e.preventDefault();

        // Формируем полезную нагрузку
        const payload = {
            ...formData,
            tags: formData.tags.split(',').map((tag) => tag.trim()),
        };

        // Отправляем данные на сервер
        axios
            .post(`${API_URL}/articles`, payload)
            .then(() => {
                alert('Статья создана');
                navigate('/'); // Возвращаемся на главную страницу
            })
            .catch((error) => {
                console.error('Ошибка создания статьи:', error);
                alert('Ошибка при создании статьи. Проверьте данные.');
            });

        // Сбрасываем форму
        setFormData({
            title: '',
            author: '',
            date: '',
            href: '',
            tags: '',
            text: '',
        });
    };

    return (
        <div className="create-article-container">
            <h2>Создать статью</h2>
            <form onSubmit={handleSubmit} className="create-article-form">
                <label>
                    Название статьи:
                    <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Автор:
                    <input
                        type="text"
                        name="author"
                        value={formData.author}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Дата публикации:
                    <input
                        type="date"
                        name="date"
                        value={formData.date}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Ссылка (href):
                    <input
                        type="url"
                        name="href"
                        value={formData.href}
                        onChange={handleChange}
                        required
                    />
                </label>
                <label>
                    Теги (через запятую):
                    <input
                        type="text"
                        name="tags"
                        value={formData.tags}
                        onChange={handleChange}
                    />
                </label>
                <label>
                    Текст статьи:
                    <textarea
                        name="text"
                        value={formData.text}
                        onChange={handleChange}
                        rows="8"
                        required
                    ></textarea>
                </label>
                <button type="submit" className="submit-button">
                    Создать статью
                </button>
            </form>
        </div>
    );
}

export default CreateArticle;
