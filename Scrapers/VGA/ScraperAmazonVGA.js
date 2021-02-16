const scraperObject = {
    url: 'https://www.amazon.com.br/s?k=Placas+de+V%C3%ADdeo&i=computers&rh=n%3A16364811011&s=price-desc-rank&_encoding=UTF8&c=ts&qid=1613325541&rnid=16254006011&ts_id=16364811011&ref=sr_nr_p_36_5&low-price=1500&high-price=',
    async scraper(browser) {
        let page = await browser.newPage();
        console.log(`Navigating to ${this.url}...`);
        await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36');

        // Navigate to the selected page
        await page.goto(this.url);
        let scrapedData = [];
        let hasNextPage = false;
        // Wait for the required DOM to be rendered
        async function scrapeCurrentPage() {
            try {

                await page.waitForSelector('.a-last');

                // Loop through the results and get the description + value
                let getPrices = (link) => new Promise(async (resolve, reject) => {

                    let results = await page.evaluate((resolve, reject) => {
                        const resultsInterno = {
                            arrayValues: [],
                            foundUnavailable: false
                        };
                        document.querySelectorAll('.a-last.a-disabled').forEach((result) => {
                            resultsInterno.foundUnavailable = true;
                        });
                        document.querySelectorAll('.s-result-item').forEach((result) => {
                            const expressoesRemovidas = ['Quadro', 'Osprey', 'Conferencia', 'Titan', 'Expansora', 'Screen Share', 'Radeon Pro', 'Microfone', 'Suporte', 'GT 710', 'GT 730', 'R5 2020', 'Cabo de extensão', 'G210', 'R7 240', 'GT 1030', ' 1GB', ' 2GB', ' 3GB', ' 4GB', '1050Ti', '1050', 'RX 550 ', 'Case para', 'Conferência'];

                            //isAvailable = Verifica se existem classes que indicam o preço
                            const isAvailable = result.getElementsByClassName('a-price-whole').length > 0;

                            //Se está disponível, adiciona aos resultados
                            if (isAvailable) {
                                //Salva valores obtidos no HTML em variáveis para facilitar a reutilização
                                const productName = result.getElementsByTagName('h2')[0].getElementsByTagName('a')[0].getElementsByTagName('span')[0].innerText;
                                const productValue = result.getElementsByClassName('a-price-whole')[0].innerText.replace('.', '') + '.' + result.getElementsByClassName('a-price-fraction')[0].innerText;
                                const productLink = 'https://www.amazon.com.br' + result.getElementsByTagName('h2')[0].getElementsByTagName('a')[0].getAttribute('href');

                                //Se o item verificado não for um dos modelos ignorados, adiciona ao vetor
                                if (!expressoesRemovidas.some(v => productName.toUpperCase().includes(v.toUpperCase())) && result.getElementsByTagName('img')[1] === undefined) {
                                    resultsInterno.arrayValues.push({
                                        Modelo: productName,
                                        ValorAV: parseFloat(productValue).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                                        ValorParc: parseFloat(productValue).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                                        Loja: 'Amazon',
                                        Link: productLink
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
                    await page.click('.a-last');
                    return scrapeCurrentPage(); // Call this function recursively
                }
                await page.close();
            } catch {
                return scrapedData;
            } finally {
                if (!hasNextPage) {
                    return scrapedData;
                }
            }
        }
        let data = await scrapeCurrentPage();
        return data;
    }
}

module.exports = scraperObject;