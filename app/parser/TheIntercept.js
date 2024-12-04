const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');

// Функция для задержки выполнения
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Функция для парсинга страницы статьи по ссылке
function fetchArticleDetails(url, callback) {
    request(url, (error, response, body) => {
        if (error) {
            console.error('Ошибка при запросе:', error);
            callback(null);
            return;
        }

        const $ = cheerio.load(body);

        // Извлечение данных статьи по указанным селекторам
        const title = $('h1').text().trim();
        const author = $('div[class^="article-byline__authors"]').text().trim();
        const date = $('div[class^="article-byline__info"] > time').attr('datetime');  // Дата публикации в формате datetime
        const text = $('div[class^="entry-content__content"] > p')
            .map((i, el) => $(el).text().trim())
            .get()
            .join('\n');  // Объединяем текст из всех абзацев

        // Формируем объект с данными статьи
        const articleDetails = { title, author, date, text, tags: [] };
        callback(articleDetails);
    });
}

// Основная функция для парсинга ссылок на статьи с главной страницы и парсинга данных каждой статьи
function scrapeTheIntercept() {
    const url = 'https://theintercept.com/';

    // Запрос к главной странице The Intercept
    request(url, async (error, response, body) => {
        if (error) {
            console.error('Ошибка при запросе:', error);
            return;
        }

        const $ = cheerio.load(body);

        // Массив для хранения ссылок на статьи
        const links = [];
        $('a[class^="content-card__link"]').each((index, element) => {
            const href = $(element).attr('href');  // Извлечение ссылки из атрибута href
            const fullLink = href;
            links.push(fullLink);
        });

        //console.log('Ссылки на статьи:', links);

        // Массив для хранения данных о статьях
        const articles = [];

        // Проходим по каждой ссылке с задержкой
        for (let i = 0; i < links.length; i++) {
            const link = links[i];
            console.log(`Извлечение данных с ${link}...`);

            // Запрашиваем данные по каждой ссылке
            await new Promise(resolve => {
                fetchArticleDetails(link, (articleDetails) => {
                    if (articleDetails) {
                        // Добавляем данные статьи в массив
                        articles.push({
                            href: link,
                            ...articleDetails
                        });
                    }
                    resolve();
                });
            });

            // Ждем 5 секунд перед следующим запросом
            await sleep(200);
        }

        // Сохранение данных в JSON файл
        fs.writeFile('json/theintercept_articles_detailed.json', JSON.stringify(articles, null, 2), (err) => {
            if (err) throw err;
            console.log('Данные с The Intercept сохранены в theintercept_articles_detailed.json');
        });
    });
}

// Запуск функции
module.exports = scrapeTheIntercept;
