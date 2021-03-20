const scraperObject = {
    url: 'https://www.terabyteshop.com.br/hardware/fontes',
    async scraper(browser) {
        let page = await browser.newPage();
        console.log(`Navigating to ${this.url}...`);
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36');
        // Navigate to the selected page
        await page.goto(this.url);
        let scrapedData = [];
        // Wait for the required DOM to be rendered
        async function scrapeCurrentPage() {
            try {
                await page.waitForSelector('.produtos-home');


                // Loop through the results and get the description + value
                let getPrices = (link) => new Promise(async (resolve, reject) => {
                    let results = await page.evaluate((resolve, reject) => {
                        const resultsInterno = {
                            arrayValues: [],
                            foundUnavailable: false
                        };
                        document.querySelectorAll('div.pbox').forEach((result) => {



                            //isAvailable = Check if there are classes indicating an unavailable item
                            const isAvailable = result.getElementsByClassName('tbt_esgotado').length === 0;

                            //If an item is not available, indicates that it is the last page of results
                            if (!isAvailable) {
                                resultsInterno.foundUnavailable = true;
                            } else {
                                //Save the HTML values on variables
                                const productName = result.getElementsByClassName('prod-name')[0].innerText;
                                let productWatts = productName.match(/[0-9]{3,4}W/i);

                                if (!productWatts) {
                                    productWatts = productName.match(/[0-9]{3,4}/i) + 'W';
                                }

                                const productValue = result.getElementsByClassName('prod-new-price')[0].getElementsByTagName('span')[0].innerText.replace('R$', '').replace('.', '').replace(',', '.');
                                const productValueInstallmentsString = result.getElementsByClassName('prod-juros')[0].getElementsByTagName('span')[1].innerText;
                                const productLink = result.getElementsByClassName('prod-name')[0].getAttribute('href');

                                const productValueInstallments = String((parseFloat(productValueInstallmentsString.replace('R$', '').replace('.', '')) * 12).toFixed(2)).replace(',', '.');

                                if (Number(productWatts[0].replace('W', '').replace('w', '')) >= 500 && productName.includes('80')) {
                                    //Saves the item information on the array
                                    resultsInterno.arrayValues.push({
                                        Modelo: productName,
                                        ValorAV: parseFloat(productValue).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                                        ValorParc: parseFloat(productValueInstallments).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                                        Loja: 'Terabyte',
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

            } catch {
                return scrapedData;
            } finally {
                await page.close();
                return scrapedData;
            }
        }
        let data = await scrapeCurrentPage();
        return data;
    }
}

module.exports = scraperObject;