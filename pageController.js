const scraperKabumVGA = require('./Scrapers/ScraperKabumVGA');
const scraperTerabyteVGA = require('./Scrapers/ScraperTerabyteVGA')
const scraperPichauVGA = require('./Scrapers/ScraperPichauVGA');
const scraperGKInfoStoreVGA = require('./Scrapers/ScraperGKInfoStoreVGA');

async function scrapeAll(browserInstance) {
    let browser;
    let results
    try {
        browser = await browserInstance;
        results = await scraperTerabyteVGA.scraper(browser);
        results = results.concat(await scraperKabumVGA.scraper(browser));
        results = results.concat(await scraperPichauVGA.scraper(browser));
        results = results.concat(await scraperGKInfoStoreVGA.scraper(browser));

        await browser.close();

        results.sort(orderArray);
        return results;
    }
    catch (err) {
        console.log("Could not resolve the browser instance => ", err);
    }
}

const orderArray = (a, b) => {

    valorAvA = parseFloat(a.ValorAV.replace('R$', '').replace('.', ''));
    valorAvB = parseFloat(b.ValorAV.replace('R$', '').replace('.', ''));
    if (valorAvA < valorAvB) {
        return -1;
    }
    if (valorAvA > valorAvB) {
        return 1;
    }
    return 0;
}

module.exports = (browserInstance) => scrapeAll(browserInstance)