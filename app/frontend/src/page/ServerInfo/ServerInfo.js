import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ServerInfo.css'; // Подключите стили, если нужно

const API_URL = 'http://localhost:5000'; // Укажите адрес API

function ServerInfo() {
    const [serverInfo, setServerInfo] = useState(null);
    const [fileContent, setFileContent] = useState(null);
    const [error, setError] = useState(null);

    // Загрузка информации об ОС
    useEffect(() => {
        axios.get(`${API_URL}/server-info`)
            .then((response) => setServerInfo(response.data))
            .catch((err) => setError('Ошибка при получении информации об ОС: ' + err.message));
    }, []);

    // Загрузка содержимого файла
    useEffect(() => {
        axios.get(`${API_URL}/read-file`)
            .then((response) => setFileContent(response.data.content))
            .catch((err) => setError('Ошибка при чтении файла: ' + err.message));
    }, []);

    if (error) {
        return <div className="error">{error}</div>;
    }

    return (
        <div className="server-info-container">
            <h1>Информация о сервере</h1>

            {serverInfo ? (
                <div className="server-details">
                    <h2>Системная информация</h2>
                    <p><strong>Платформа:</strong> {serverInfo.platform}</p>
                    <p><strong>Архитектура:</strong> {serverInfo.arch}</p>
                    <p><strong>Время работы (сек.):</strong> {serverInfo.uptime}</p>
                    <p><strong>Имя хоста:</strong> {serverInfo.hostname}</p>
                    <p><strong>Всего памяти (байт):</strong> {serverInfo.memory.total}</p>
                    <p><strong>Свободная память (байт):</strong> {serverInfo.memory.free}</p>
                    <h3>Процессоры:</h3>
                    <ul>
                        {serverInfo.cpu.map((cpu, index) => (
                            <li key={index}>{cpu.model} (скорость: {cpu.speed} MHz)</li>
                        ))}
                    </ul>
                </div>
            ) : (
                <p>Загрузка информации о сервере...</p>
            )}

            <h2>Содержимое файла</h2>
            {fileContent ? (
                <pre className="file-content">{fileContent}</pre>
            ) : (
                <p>Загрузка содержимого файла...</p>
            )}
        </div>
    );
}

export default ServerInfo;
