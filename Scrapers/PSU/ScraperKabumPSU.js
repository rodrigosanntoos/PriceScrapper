const scraperObject = {
    url: 'https://www.kabum.com.br/hardware/fontes?pagina=1&ordem=3&limite=100&prime=false&marcas=[]&tipo_produto=[]&filtro=[]',
    async scraper(browser) {
        let page = await browser.newPage();
        console.log(`Navigating to ${this.url}...`);
        // Navigate to the selected page
        await page.goto(this.url);
        let scrapedData = [];
        let hasNextPage = false;
        // Wait for the required DOM to be rendered
        async function scrapeCurrentPage() {
            try {
                await page.waitForSelector('.wjuxx');


                // Loop through the results and get the description + value
                let getPrices = (link) => new Promise(async (resolve, reject) => {
                    let results = await page.evaluate((resolve, reject) => {
                        const resultsInterno = {
                            arrayValues: [],
                            foundUnavailable: false
                        };
                        document.querySelectorAll('div.jmuOAh').forEach((result) => {
                            //isAvailable = Check if there are classes indicating an unavailable item
                            const isAvailable = result.getElementsByClassName('jLtPVV').length === 0;

                            //If an item is not available, indicates that it is the last page of results
                            if (!isAvailable) {
                                resultsInterno.foundUnavailable = true;
                            } else {

                                //Save the HTML values on variables
                                const productName = result.getElementsByClassName('item-nome')[0].innerText;
                                let productWatts = productName.match(/[0-9]{3,4}W/i);

                                if (!productWatts) {
                                    productWatts = productName.match(/[0-9]{3,4}/i) + 'W';
                                }

                                const productValue = result.getElementsByClassName('qatGF')[0].innerText.replace('R$ ', '').replace('.', '').replace(',', '.');
                                const productValueInstallments = result.getElementsByClassName('ksiZrQ')[0].innerText.replace('R$', '').replace('.', '').replace(',', '.');
                                const productLink = 'https://www.kabum.com.br' + result.getElementsByClassName('dIEkef')[0].getElementsByTagName('a')[0].getAttribute('href');

                                if (Number(productWatts[0].replace('W', '').replace('w', '')) >= 500 && productName.includes('80')) {
                                    //Saves the item information on the array
                                    resultsInterno.arrayValues.push({
                                        Modelo: productName,
                                        ValorAV: parseFloat(productValue).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                                        ValorParc: parseFloat(productValueInstallments).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                                        Loja: 'Kabum',
                                        Link: productLink,
                                        Watts: productWatts[0]
                                    });
                                }
                            }
                        });
                        return resultsInterno;
                    })
                    resolve(results);

                });

                let infoFromPage = await getPrices();
                scrapedData = scrapedData.concat(infoFromPage.arrayValues);
                hasNextPage = !infoFromPage.foundUnavailable;


                if (hasNextPage) {
                    await page.click('.hEjrXm');
                    return scrapeCurrentPage(); // Call this function recursively
                }
            } catch {
                return scrapedData;
            } finally {
                if (!hasNextPage) {
                    await page.close();
                    return scrapedData;
                }
            }
        }
        let data = await scrapeCurrentPage();
        return data;
    }
}

module.exports = scraperObject;