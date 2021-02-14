const scraperKabum = require('./ScraperKabum');
const scraperTerabyte = require('./ScraperTerabyte')
const scraperPichau = require('./ScraperPichau');
async function scrapeAll(browserInstance) {
    let browser;
    let results
    try {
        browser = await browserInstance;
        results = await scraperTerabyte.scraper(browser);
        results = results.concat(await scraperKabum.scraper(browser));
        results = results.concat(await scraperPichau.scraper(browser));

        await browser.close();

        results.sort(orderArray);
        return results;
    }
    catch (err) {
        console.log("Could not resolve the browser instance => ", err);
    }
}

const orderArray = (a, b) => {

    valorAvA = parseFloat(a.valorAV.replace('R$', '').replace('.', ''));
    valorAvB = parseFloat(b.valorAV.replace('R$', '').replace('.', ''));
    if (valorAvA < valorAvB) {
        return -1;
    }
    if (valorAvA > valorAvB) {
        return 1;
    }
    return 0;
}

module.exports = (browserInstance) => scrapeAll(browserInstance)