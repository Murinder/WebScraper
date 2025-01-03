const request = require('request');
const cheerio = require('cheerio');
const fs = require('fs');

// Функция для задержки выполнения
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Функция для запроса и парсинга страницы статьи по ссылке
function fetchArticleDetails(url, callback) {
    request(url, (error, response, body) => {
        if (error) {
            console.error('Ошибка при запросе:', error);
            callback(null);
            return;
        }

        const $ = cheerio.load(body);

        // Извлечение данных по указанным селекторам из файла ОДВР
        const author = $('a[class^="ArticleBylines_link"]').text().trim();  // Автор статьи
        const tags = $('a[data-event-element="rubric"]').map((i, el) => $(el).text().trim()).get(); // Рубрика статьи
        let date = $('[class^="ArticleTimestamp_root__"]').text().trim();  // Дата публикации
        if(date.indexOf(',') !== date.lastIndexOf(',')){
            date = date.slice(0, date.lastIndexOf(','));
        }
        const text = $('p[class^="ArticleParagraph_root"]').text().trim();  // Текст статьи

        // Формируем объект с данными
        const articleDetails = { author, date, text, tags};
        callback(articleDetails);
    });
}

// Основная функция для парсинга главной страницы и сбора ссылок на статьи
async function scrapeAtlantic() {
    const url = 'https://www.theatlantic.com/';

    request(url, async (error, response, body) => {
        if (error) {
            console.error('Ошибка при запросе:', error);
            return;
        }

        const $ = cheerio.load(body);

        // Массив для хранения данных о статьях
        const articles = [];

        // Извлекаем ссылки по селектору 'a[class*="titleLink"]'
        const links = [];
        $('a[class*="titleLink"]').each((index, element) => {
            const href = $(element).attr('href');  // Ссылка на статью
            const title = $(element).text().trim();  // Заголовок статьи

            if (href) {
                links.push({ href, title });
            }
        });

        // Проходим по каждой ссылке с задержкой
        for (let i = 0; i < links.length; i++) {
            const link = links[i];

            console.log(`Извлечение данных с ${link.href}...`);

            // Запрашиваем данные по каждой ссылке
            await new Promise(resolve => {
                fetchArticleDetails(link.href, (articleDetails) => {
                    if (articleDetails) {
                        // Добавляем данные статьи в массив
                        articles.push({
                            href: link.href,
                            title: link.title,
                            ...articleDetails
                        });
                    }
                    resolve();
                });
            });

            // Ждем 5 секунд перед следующим запросом
            await sleep(200);
        }

        // Сохраняем собранные данные в JSON файл
        fs.writeFile('json/atlantic_articles_detailed.json', JSON.stringify(articles, null, 2), (err) => {
            if (err) throw err;
            console.log('Данные с The Atlantic сохранены в atlantic_articles_detailed.json');
        });
    });
}

// Запуск функции для сбора данных
module.exports = scrapeAtlantic;
