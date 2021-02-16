const scraperObject = {
    url: 'https://www.gkinfostore.com.br/placa-de-video?sort=price&limit=48',
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
                await page.waitForSelector('.container-fluid.mb-4');


                // Loop through the results and get the description + value
                let getPrices = (link) => new Promise(async (resolve, reject) => {
                    let results = await page.evaluate((resolve, reject) => {
                        const resultsInterno = {
                            arrayValues: [],
                            foundUnavailable: false
                        };
                        document.querySelectorAll('.product-card').forEach((result) => {



                            //isAvailable = Verifica se existem classe que indica o botão comprar. Pode existir botão de pré-venda, portanto não pode verificar a classe de indisponível
                            const isAvailable = result.getElementsByClassName('product-buy-button ').length > 0;


                            //Se um item não está disponível, indica que é a última página de resultados
                            if (!isAvailable) {
                                resultsInterno.foundUnavailable = true;
                            } else {

                                //Salva valores obtidos no HTML em variáveis para facilitar a reutilização
                                const productName = result.getElementsByClassName('product-title')[0].getElementsByTagName('h2')[0].innerText;
                                let productWatts = productName.match(/[0-9]{3,4}W/i);

                                if (!productWatts) {
                                    productWatts = productName.match(/[0-9]{3,4}/i) + 'W';
                                }
                                const productValue = result.getElementsByClassName('product-price-final')[0].getElementsByClassName('total')[0].innerText.replace('R$ ', '').replace('.', '').replace(',', '.');
                                const productValueInstallments = result.getElementsByClassName('installments')[0].getElementsByClassName('total')[0].innerText.replace('R$ ', '').replace('.', '').replace(',', '.');
                                const productLink = result.getElementsByClassName('product-link')[0].getAttribute('href');

                                if (productWatts >= 500) {

                                    //Se o item verificado estiver disponível salva no vetor
                                    resultsInterno.arrayValues.push({
                                        Modelo: productName,
                                        ValorAV: parseFloat(productValue).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                                        ValorParc: parseFloat(productValueInstallments).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                                        Loja: 'GKInfoStore',
                                        Link: productLink,
                                        Watts: productWatts
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