const scraperKabumPSU = require('./Scrapers/PSU/ScraperKabumPSU');
const scraperTerabytePSU = require('./Scrapers/PSU/ScraperTerabytePSU')
const scraperPichauPSU = require('./Scrapers/PSU/ScraperPichauPSU');
const scraperGKInfoStorePSU = require('./Scrapers/PSU/ScraperGKInfoStorePSU');

async function scrapeAll(browserInstance) {
    let browser;
    let currentdate = new Date();

    currentdate.setTime(currentdate.getTime() + currentdate.getTimezoneOffset() * 60 * 1000 - (3) * 60 * 60 * 1000);

    let results = [
        {
            Modelo: 'Última atualização: ' + currentdate.getDate() + "/"
                + (currentdate.getMonth() + 1) + "/"
                + currentdate.getFullYear() + " @ "
                + currentdate.getHours() + ":"
                + currentdate.getMinutes() + ":"
                + currentdate.getSeconds(),
            ValorAV: String(0.00),
            ValorParc: String(0.00),
            Loja: '',
            Link: '/',
            Watts: '0'
        }
    ]
    try {
        browser = await browserInstance;
        results = results.concat(await scraperTerabytePSU.scraper(browser));
        results = results.concat(await scraperKabumPSU.scraper(browser));
        results = results.concat(await scraperPichauPSU.scraper(browser));
        results = results.concat(await scraperGKInfoStorePSU.scraper(browser));
        // results = results.concat(await scraperAmazonPSU.scraper(browser));


        results.sort(orderArray);
        return results;
    }
    catch (err) {
        console.log("Could not resolve the browser instance => ", err);
    } finally {
        await browser.close();
    }
}

const orderArray = (a, b) => {
    const valorAvA = parseFloat(a.ValorAV.replace('R$', '').replace('.', '').replace(',', '.'));
    const valorAvB = parseFloat(b.ValorAV.replace('R$', '').replace('.', '').replace(',', '.'));

    if (valorAvA < valorAvB) {
        return -1;
    }
    if (valorAvA > valorAvB) {
        return 1;
    }
    return 0;
}

module.exports = (browserInstance) => scrapeAll(browserInstance)