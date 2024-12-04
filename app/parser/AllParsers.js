const scrapeHuffPost = require('./HuffPost.js');
const scrapeSalon  = require('./Salon.js');
const scrapeAtlantic = require('./TheAtlantic.js');
const scrapeGuardian = require('./TheGuardian.js');
const scrapeTheIntercept = require('./TheIntercept.js');

// Функция для последовательного запуска всех парсеров
async function runAllParsers() {
    try {
        console.log('Запуск парсера The Guardian...');
        await scrapeGuardian();
        console.log('Парсер The Guardian завершен.\n');

        console.log('Запуск парсера HuffPost...');
        await scrapeHuffPost();
        console.log('Парсер HuffPost завершен.\n');

        console.log('Запуск парсера Medium...');
        await scrapeAtlantic();
        console.log('Парсер Medium завершен.\n');

        console.log('Запуск парсера Salon...');
        await scrapeSalon();
        console.log('Парсер Salon завершен.\n');

        console.log('Запуск парсера The Intercept...');
        await scrapeTheIntercept();
        console.log('Парсер The Intercept завершен.\n');

        console.log('Все парсеры завершены.');
    } catch (error) {
        console.error('Ошибка при запуске парсеров:', error);
    }
}

// Запуск всех парсеров
runAllParsers();