const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const os = require('os');
const fs = require('fs');
const path = require('path');
const { Article } = require('./models');
const { Op } = require('sequelize');


const app = express();
const port = 5000;

app.use(cors());
app.use(bodyParser.json());

/**
 * GET /articles
 * Получить список всех статей
 */
app.get('/articles', async (req, res) => {
    const { sortBy, order, filterBy, filterValue } = req.query;

    try {
        let where = {};
        if (filterBy && filterBy === 'title' && filterValue) {
            where.title = { [Op.iLike]: `%${filterValue}%` }; // Фильтрация по названию (игнорируя регистр)
        }

        const orderOption = [];
        if (sortBy) {
            orderOption.push([sortBy, order || 'asc']); // Если задана сортировка, применяем её
        }

        const articles = await Article.findAll({
            attributes: ['id', 'title'],
            where,
            order: orderOption,
        });

        res.json(articles);
    } catch (err) {
        console.error('Ошибка при получении списка статей:', err);
        res.status(500).json({ error: 'Ошибка при получении списка статей' });
    }
});


/**
 * GET /articles/:id
 * Получить одну статью по ID
 */
app.get('/articles/:id', async (req, res) => {
    try {
        const article = await Article.findByPk(req.params.id);
        if (!article) {
            return res.status(404).json({ error: 'Статья не найдена' });
        }
        res.json(article);
    } catch (err) {
        console.error('Ошибка при получении статьи:', err);
        res.status(500).json({ error: 'Ошибка при получении статьи' });
    }
});

/**
 * POST /articles
 * Создать новую статью
 */
app.post('/articles', async (req, res) => {
    const { title, author, date, text, href, tags } = req.body;
    try {
        const newArticle = await Article.create({ title, author, date, text, href, tags });
        res.status(201).json(newArticle);
    } catch (err) {
        console.error('Ошибка при создании статьи:', err);
        res.status(500).json({ error: 'Ошибка при создании статьи' });
    }
});

/**
 * PUT /articles/:id
 * Обновить существующую статью по ID
 */
app.put('/articles/:id', async (req, res) => {
    const { title, author, date, text, href, tags } = req.body;
    try {
        const article = await Article.findByPk(req.params.id);
        if (!article) {
            return res.status(404).json({ error: 'Статья не найдена' });
        }

        await article.update({ title, author, date, text, href, tags });
        res.json(article);
    } catch (err) {
        console.error('Ошибка при обновлении статьи:', err);
        res.status(500).json({ error: 'Ошибка при обновлении статьи' });
    }
});

/**
 * DELETE /articles/:id
 * Удалить статью по ID
 */
app.delete('/articles/:id', async (req, res) => {
    try {
        const article = await Article.findByPk(req.params.id);
        if (!article) {
            return res.status(404).json({ error: 'Статья не найдена' });
        }

        await article.destroy();
        res.status(204).send(); // Успешное удаление без тела ответа
    } catch (err) {
        console.error('Ошибка при удалении статьи:', err);
        res.status(500).json({ error: 'Ошибка при удалении статьи' });
    }
});

/**
 * GET /analytics
 * Получение аналитики
 */
app.get('/analytics', async (req, res) => {
    try {
        const articles = await Article.findAll();
        const wordCounts = articles.map(article => ({
            title: article.title,
            wordCount: article.text.split(' ').length
        }));

        const tags = {};
        articles.forEach(article => {
            (article.tags || []).forEach(tag => {
                tags[tag] = (tags[tag] || 0) + 1;
            });
        });

        const dates = {};
        articles.forEach(article => {
            const date = article.date ? article.date.toISOString().split('T')[0] : 'Unknown';
            dates[date] = (dates[date] || 0) + 1;
        });

        res.json({ wordCounts, tags, dates });
    } catch (err) {
        res.status(500).json({ error: 'Ошибка при получении аналитики' });
    }
});

/**
 * GET /server-info
 * Получение информации об операционной системе сервера
 */
app.get('/server-info', (req, res) => {
    const serverInfo = {
        platform: os.platform(),
        arch: os.arch(),
        uptime: os.uptime(),
        hostname: os.hostname(),
        cpu: os.cpus(),
        memory: {
            total: os.totalmem(),
            free: os.freemem(),
        },
    };

    res.json(serverInfo);
});

/**
 * GET /read-file
 * Получение содержимого файла на сервере
 */
app.get('/read-file', (req, res) => {
    const filePath = path.join(__dirname, '', 'HelloMessage.txt'); // Путь к файлу

    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Ошибка при чтении файла:', err.message);
            return res.status(500).json({ error: 'Не удалось прочитать файл.' });
        }
        res.json({ content: data });
    });
});

// Запуск сервера
app.listen(port, () => console.log(`Сервер запущен на http://localhost:${port}`));
