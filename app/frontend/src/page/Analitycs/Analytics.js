import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

function DataFetchingComponent() {
    const [wordCounts, setWordCounts] = useState([]);
    const [tags, setTags] = useState({});
    const [dates, setDates] = useState({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/analytics'); // Замените на ваш API
                console.log('Данные получены:', response.data);

                setWordCounts(response.data.wordCounts || []);
                setTags(response.data.tags || {});
                setDates(response.data.dates || {});
            } catch (error) {
                console.error('Ошибка при получении данных:', error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    if (loading) {
        return <div>Загрузка...</div>;
    }

    if (error) {
        return <div>Ошибка: {error}</div>;
    }

    // Подготовка данных для графиков
    const wordCountLabels = wordCounts.map(item => item.title);
    const wordCountValues = wordCounts.map(item => item.wordCount);

    const tagLabels = Object.keys(tags);
    const tagValues = Object.values(tags);

    const dateLabels = Object.keys(dates);
    const dateValues = Object.values(dates);

    return (
        <div>
            <h1>Графики распределения</h1>

            <h2>Количество слов в статьях</h2>
            <Bar
                data={{
                    labels: wordCountLabels,
                    datasets: [
                        {
                            label: 'Количество слов',
                            data: wordCountValues,
                            backgroundColor: 'rgba(75, 192, 192, 0.6)',
                        },
                    ],
                }}
                options={{
                    responsive: true,
                    plugins: {
                        legend: {
                            display: true,
                        },
                    },
                }}
            />

            <h2>Использование тегов</h2>
            <Bar
                data={{
                    labels: tagLabels,
                    datasets: [
                        {
                            label: 'Количество использований',
                            data: tagValues,
                            backgroundColor: 'rgba(153, 102, 255, 0.6)',
                        },
                    ],
                }}
                options={{
                    responsive: true,
                    plugins: {
                        legend: {
                            display: true,
                        },
                    },
                }}
            />

            <h2>Количество статей по датам</h2>
            <Bar
                data={{
                    labels: dateLabels,
                    datasets: [
                        {
                            label: 'Количество статей',
                            data: dateValues,
                            backgroundColor: 'rgba(255, 159, 64, 0.6)',
                        },
                    ],
                }}
                options={{
                    responsive: true,
                    plugins: {
                        legend: {
                            display: true,
                        },
                    },
                }}
            />
        </div>
    );
}

function App() {
    return (
        <div className="App">
            <DataFetchingComponent />
        </div>
    );
}

export default App;
