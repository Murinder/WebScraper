const fs = require('fs');
const { Client } = require('pg');

// Настройки подключения к базе данных PostgreSQL
const client = new Client({
    user: 'postgres',      // Замените на ваше имя пользователя
    host: 'localhost',
    database: 'WebScraper',   // Замените на имя вашей базы данных
    password: 'Patronus',   // Замените на ваш пароль
    port: 5432,
});

// Подключение к базе данных
async function connectToDatabase() {
    try {
        await client.connect();
        console.log('Подключено к базе данных PostgreSQL');
    } catch (err) {
        console.error('Ошибка подключения к базе данных:', err);
    }
}

// Функция для вставки данных в таблицу
async function insertArticles(articles) {
    for (let article of articles) {
        try {
            // Пропуск статьи, если поле text пустое
            if (!article.text || article.text.trim() === '') {
                console.log(`Пропуск статьи без текста: ${article.title}`);
                continue;
            }

            // Преобразование даты из строки в объект Date
            let formattedDate = null;
            if (article.date) {
                try {
                    formattedDate = new Date(article.date);
                    if (isNaN(formattedDate)) throw new Error('Invalid date');
                } catch (err) {
                    console.error(`Ошибка конвертации даты для статьи '${article.title}': ${article.date}`);
                    continue;  // Пропуск записи при ошибке конвертации даты
                }
            }

            // SQL-запрос для вставки с исключением дубликатов
            const query = `
                INSERT INTO articles (title, author, date, text, href, tags)
                VALUES ($1, $2, $3, $4, $5, $6)
                ON CONFLICT (href) DO NOTHING;
            `;
            const values = [
                article.title,
                article.author,
                formattedDate,
                article.text,
                article.href,  // Уникальное значение ссылки
                article.tags || []  // Пустой массив, если тэгов нет
            ];

            await client.query(query, values);
            console.log(`Данные статьи '${article.title}' добавлены в базу данных.`);
        } catch (err) {
            console.error(`Ошибка вставки данных для статьи '${article.title}':`, err);
        }
    }
}

// Функция для загрузки данных из файлов и записи в БД
async function loadDataAndInsert() {
    // Файлы JSON с данными статей
    const files = [
        'guardian_articles_detailed.json',
        'huffpost_articles_detailed.json',
        'atlantic_articles_detailed.json',
        'salon_articles_detailed.json',
        'theintercept_articles_detailed.json'
    ];

    for (let file of files) {
        try {
            // Чтение и парсинг данных из JSON-файла
            const data = JSON.parse(fs.readFileSync(file, 'utf8'));
            console.log(`Загрузка данных из ${file}`);

            // Вставка данных в базу
            await insertArticles(data);
        } catch (err) {
            console.error(`Ошибка при обработке файла ${file}:`, err);
        }
    }
}

// Основная функция
async function main() {
    await connectToDatabase();
    await loadDataAndInsert();
    await client.end();
    console.log('Завершение работы скрипта.');
}

// Запуск основной функции
main();
