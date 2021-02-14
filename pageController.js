const pageScraper = require('./pageScraper');
const fs =  require('fs');
async function scrapeAll(browserInstance){
    let browser;
    try{
        browser = await browserInstance;
        let results = await pageScraper.scraper(browser); 
        await browser.close();
        let dataForFile = JSON.stringify(results);
        fs.writeFileSync('teste.json', dataForFile);
    }
    catch(err){
        console.log("Could not resolve the browser instance => ", err);
    }
}

module.exports = (browserInstance) => scrapeAll(browserInstance)