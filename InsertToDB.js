const fs = require('fs');
const { Sequelize, DataTypes } = require('sequelize');

// Настройки подключения к базе данных PostgreSQL
const sequelize = new Sequelize('WebScraper', 'postgres', 'Patronus', {
    host: 'localhost',
    dialect: 'postgres',
});

// Определение модели для таблицы articles
const Article = sequelize.define('Article', {
    title: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    author: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    date: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    text: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    href: {
        type: DataTypes.TEXT,
        unique: true,
        allowNull: false,
    },
    tags: {
        type: DataTypes.ARRAY(DataTypes.STRING),
        allowNull: true,
    }
}, {
    // Опции модели
    tableName: 'articles',
    timestamps: false, // Если не нужны временные метки createdAt и updatedAt
});

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
                    console.error(`Ошибка конвертации даты для статьи ${article.title}: ${article.date}`);
                    continue;  // Пропуск записи при ошибке конвертации даты
                }
            }

            // Вставка или игнорирование дубликатов
            await Article.upsert({
                title: article.title,
                author: article.author,
                date: formattedDate,
                text: article.text,
                href: article.href,  // Уникальное значение ссылки
                tags: article.tags || []  // Пустой массив, если тэгов нет
            });
            console.log(`Данные статьи ${article.title} добавлены в базу данных.`);
        } catch (err) {
            console.error(`Ошибка вставки данных для статьи ${article.title}:`, err);
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
            console.log('Загрузка данных из ${file}');

            // Вставка данных в базу
            await insertArticles(data);
        } catch (err) {
            console.error('Ошибка при обработке файла ${file}:', err);
        }
    }
}

// Основная функция
async function main() {
    try {
        await sequelize.authenticate();
        console.log('Подключено к базе данных PostgreSQL');

        // Синхронизация модели с базой данных (создание таблицы, если она не существует)
        await Article.sync();

        await loadDataAndInsert();
    } catch (err) {
        console.error(`Ошибка при подключении к базе данных:`, err);
    } finally {
        await sequelize.close();
        console.log(`Завершение работы скрипта.`);
    }
}

// Запуск основной функции
main();
