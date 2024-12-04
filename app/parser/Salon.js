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
        let date = $('h3[class="publish_date"]').text().trim();
        // Если date пустое, берём данные из h6
        if (!date) {
            date = $('h6').first().text().trim();  // Извлечение текста первого h6
        }
        date = date.replace(/^Published\s+/i, '');// Отсечение первого слова "Published"
        date = date.slice(0, date.length - 16);

        const author = $('h3[class="writer_name"] > a').text().trim();
        const title = $('h1').text().trim();
        const text = $('article[class="article-content"] > p')
            .map((i, el) => $(el).text().trim())
            .get()
            .join('\n');  // Объединяем текст из всех абзацев

        // Формируем объект с данными статьи
        const articleDetails = { title, author, date,  text, tags: [] };

        // Проверка, чтобы не добавлять статью без текста
        if (text) {
            callback(articleDetails);
        } else {
            callback(null);
        }
    });
}

// Основная функция для парсинга ссылок на статьи с главной страницы и парсинга данных каждой статьи
function scrapeSalon() {
    const url = 'https://www.salon.com/';

    // Запрос к главной странице Salon
    request(url, async (error, response, body) => {
        if (error) {
            console.error('Ошибка при запросе:', error);
            return;
        }

        const $ = cheerio.load(body);

        // Массив для хранения ссылок на статьи
        const links = [];
        $('div[class*="article"] > a').each((index, element) => {
            const href = $(element).attr('href');  // Извлечение ссылки из атрибута href
            if (href) {
                // Преобразуем относительную ссылку в полную, если необходимо
                const fullLink = href.startsWith('http') ? href : `https://www.salon.com/${href}`;
                links.push(fullLink);
            }
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
            await sleep(200);  // Здесь задержка установлена на 5 секунд
        }

        // Сохранение данных в JSON файл
        fs.writeFile('json/salon_articles_detailed.json', JSON.stringify(articles, null, 2), (err) => {
            if (err) throw err;
            console.log('Данные с Salon сохранены в salon_articles_detailed.json');
        });
    });
}

// Запуск функции
module.exports = scrapeSalon;
