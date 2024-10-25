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

        // Извлечение данных по указанным селекторам
        const title = $('h1').text().trim(); // Текст ссылки (заголовок статьи)
        const author = $('a[rel="author"]').text().trim();
        let date = ($('span[class="dcr-u0h1qy"]').text().trim());
        if(!date) date = $('div[class="dcr-1pexjb9"]').text().trim();
        date = date.slice(4, date.length - 11);
        const tags = $('a[data-link-name="article section"] > span').map((i, el) => $(el).text().trim()).get();
        const text = $('#maincontent > div > p').text().trim();

        // Формируем объект с данными
        const articleDetails = { title, author, date,  text, tags};
        callback(articleDetails);
    });
}

// Основная функция для парсинга главной страницы и сбора ссылок
async function scrapeGuardian() {
    const url = 'https://www.theguardian.com/international';

    request(url, async (error, response, body) => {
        if (error) {
            console.error('Ошибка при запросе:', error);
            return;
        }

        const $ = cheerio.load(body);

        // Массив для хранения данных о статьях
        const articles = [];

        // Извлекаем ссылки по селектору 'a[class="dcr-lv2v9o"]'
        const links = [];
        $('a[class="dcr-lv2v9o"]').each((index, element) => {
            const href = "https://www.theguardian.com" + $(element).attr('href'); // Ссылка на статью

            if (href) {
                links.push({ href });
            }
        });
        //console.log(links);

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
        fs.writeFile('guardian_articles_detailed.json', JSON.stringify(articles, null, 2), (err) => {
            if (err) throw err;
            console.log('Данные с The Guardian сохранены в guardian_articles_detailed.json');
        });
    });
}

// Запуск функции для сбора данных
module.exports = scrapeGuardian;
