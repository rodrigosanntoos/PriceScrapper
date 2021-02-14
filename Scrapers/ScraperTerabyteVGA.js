const scraperObject = {
    url: 'https://www.terabyteshop.com.br/hardware/placas-de-video',
    async scraper(browser) {
        let page = await browser.newPage();
        console.log(`Navigating to ${this.url}...`);
        // Navigate to the selected page
        await page.goto(this.url);
        let scrapedData = [];
        let hasNextPage = false;
        // Wait for the required DOM to be rendered
        async function scrapeCurrentPage() {
            await page.waitForSelector('.produtos-home');


            // Loop through the results and get the description + value
            let getPrices = (link) => new Promise(async (resolve, reject) => {
                let results = await page.evaluate((resolve, reject) => {
                    const resultsInterno = {
                        arrayValues: [],
                        foundUnavailable: false
                    };
                    document.querySelectorAll('div.pbox').forEach((result) => {



                        //isAvailable = Verifica se existem classes que indicam item indisponível
                        const isAvailable = result.getElementsByClassName('tbt_esgotado').length === 0;

                        //Se um item não está disponível, indica que é a última página de resultados
                        if (!isAvailable) {
                            resultsInterno.foundUnavailable = true;
                        } else {
                            //Salva valores obtidos no HTML em variáveis para facilitar a reutilização
                            const productName = result.getElementsByClassName('prod-name')[0].innerText;
                            const productValue = result.getElementsByClassName('prod-new-price')[0].getElementsByTagName('span')[0].innerText;
                            const productValueInstallmentsString = result.getElementsByClassName('prod-juros')[0].getElementsByTagName('span')[1].innerText;
                            const productLink = result.getElementsByClassName('prod-name')[0].getAttribute('href');

                            const productValueInstallments = 'R$ ' + String((parseFloat(productValueInstallmentsString.replace('R$', '').replace('.', '')) * 12).toFixed(2));
                            //Se o item verificado estiver disponível salva no vetor
                            resultsInterno.arrayValues.push({
                                Nome: productName,
                                ValorAV: productValue,
                                ValorParc: productValueInstallments,
                                Loja: 'Terabyte',
                                Link: productLink
                            });
                        }
                    });
                    return resultsInterno;
                })
                resolve(results);

            });

            let infoFromPage = await getPrices();
            scrapedData = scrapedData.concat(infoFromPage.arrayValues);

            await page.close();
            return scrapedData;
        }
        let data = await scrapeCurrentPage();
        // console.log(data);
        return data;
    }
}

module.exports = scraperObject;