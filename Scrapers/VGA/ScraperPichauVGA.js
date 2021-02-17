const scraperObject = {
    url: 'https://www.pichau.com.br/hardware/placa-de-video?product_list_limit=48&product_list_order=price',
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

                await page.waitForSelector('.products-grid');


                // Loop through the results and get the description + value
                let getPrices = (link) => new Promise(async (resolve, reject) => {
                    let results = await page.evaluate((resolve, reject) => {
                        const resultsInterno = {
                            arrayValues: [],
                            foundUnavailable: false
                        };
                        document.querySelectorAll('.product-item').forEach((result) => {



                            //isAvailable = Verifica se existem classes que indicam item indisponível
                            const isAvailable = result.getElementsByClassName('unavailable').length === 0;
                            const expressoesRemovidas = ['Quadro', 'Osprey', 'Conferencia', 'Titan', 'Expansora', 'Screen Share', 'Radeon Pro', 'Microfone', 'Suporte', 'GT 710', 'GT 730', 'R5 2020', 'Cabo de extensão', 'G210', 'R7 240', 'GT 1030', ' 1GB', ' 2GB', ' 3GB', ' 4GB', '1050Ti', '1050', 'RX 550 ', 'Case para', 'Conferência'];

                            //Se um item não está disponível, indica que é a última página de resultados
                            if (!isAvailable) {
                                resultsInterno.foundUnavailable = true;
                            } else {

                                //Salva valores obtidos no HTML em variáveis para facilitar a reutilização
                                const productName = result.getElementsByClassName('product-item-link')[0].innerText;
                                const productValueString = result.getElementsByClassName('price-boleto')[0].getElementsByTagName('span')[0].innerText;
                                const productValueInstallmentsString = result.getElementsByClassName('price-installments')[0].innerText;
                                const productLink = result.getElementsByClassName('product-item-link')[0].getAttribute('href');


                                const productValue = productValueString.replace('à vista', '').replace('R$', '').replace('.', '').replace(',', '.');
                                const productValueInstallments = String((parseFloat(productValueInstallmentsString.replace('10x de R$', '').replace('.', '')) * 10).toFixed(2));

                                //Se o item verificado estiver disponível e não consta nas expressões removidas, salva no vetor
                                if (!expressoesRemovidas.some(v => productName.toUpperCase().includes(v.toUpperCase()))) {
                                    resultsInterno.arrayValues.push({
                                        Modelo: productName,
                                        ValorAV: parseFloat(productValue).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                                        ValorParc: parseFloat(productValueInstallments).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                                        Loja: 'Pichau',
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
                    await page.click('.next');
                    return scrapeCurrentPage(); // Call this function recursively
                }
                await page.close();
                return scrapedData;
            } catch {
                return [];
            }
    }
        let data = await scrapeCurrentPage();
        return data;
    }
}

module.exports = scraperObject;