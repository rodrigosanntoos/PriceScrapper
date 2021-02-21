const scraperKabumVGA = require('./Scrapers/VGA/ScraperKabumVGA');
const scraperTerabyteVGA = require('./Scrapers/VGA/ScraperTerabyteVGA')
const scraperPichauVGA = require('./Scrapers/VGA/ScraperPichauVGA');
const scraperGKInfoStoreVGA = require('./Scrapers/VGA/ScraperGKInfoStoreVGA');
const scraperAmazonVGA = require('./Scrapers/VGA/ScraperAmazonVGA');
const scraperFGTecVGA = require('./Scrapers/VGA/ScraperFGTec');

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
            Link: '/'
        }
    ]
    try {
        browser = await browserInstance;
        results = results.concat(await scraperFGTecVGA.scraper(browser));
        results = results.concat(await scraperTerabyteVGA.scraper(browser));
        results = results.concat(await scraperKabumVGA.scraper(browser));
        results = results.concat(await scraperPichauVGA.scraper(browser));
        results = results.concat(await scraperGKInfoStoreVGA.scraper(browser));
        results = results.concat(await scraperAmazonVGA.scraper(browser));


        await browser.close();

        results.sort(orderArray);
        return results;
    }
    catch (err) {
        console.log("Could not resolve the browser instance => ", err);
    }
}

const orderArray = (a, b) => {
    valorAvA = parseFloat(a.ValorAV.replace('R$', '').replace('.', '').replace(',', '.'));
    valorAvB = parseFloat(b.ValorAV.replace('R$', '').replace('.', '').replace(',', '.'));

    if (valorAvA < valorAvB) {
        return -1;
    }
    if (valorAvA > valorAvB) {
        return 1;
    }
    return 0;
}

module.exports = (browserInstance) => scrapeAll(browserInstance)