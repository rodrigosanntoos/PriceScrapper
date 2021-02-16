const scraperObject = {
    url: 'https://www.terabyteshop.com.br/hardware/placas-de-video',
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



                            //isAvailable = Verifica se existem classes que indicam item indisponível
                            const isAvailable = result.getElementsByClassName('tbt_esgotado').length === 0;
                            const expressoesRemovidas = ['Quadro', 'Osprey', 'Conferencia', 'Titan', 'Expansora', 'Screen Share', 'Radeon Pro', 'Microfone', 'Suporte', 'GT 710', 'GT 730', 'R5 2020', 'Cabo de extensão', 'G210', 'R7 240', 'GT 1030', ' 1GB', ' 2GB', ' 3GB', ' 4GB', '1050Ti', '1050', 'RX 550 ', 'Case para', 'Conferência'];

                            //Se um item não está disponível, indica que é a última página de resultados
                            if (!isAvailable) {
                                resultsInterno.foundUnavailable = true;
                            } else {
                                //Salva valores obtidos no HTML em variáveis para facilitar a reutilização
                                const productName = result.getElementsByClassName('prod-name')[0].innerText;
                                const productValue = result.getElementsByClassName('prod-new-price')[0].getElementsByTagName('span')[0].innerText.replace('R$', '').replace('.', '').replace(',', '.');
                                const productValueInstallmentsString = result.getElementsByClassName('prod-juros')[0].getElementsByTagName('span')[1].innerText;
                                const productLink = result.getElementsByClassName('prod-name')[0].getAttribute('href');

                                const productValueInstallments = String((parseFloat(productValueInstallmentsString.replace('R$', '').replace('.', '')) * 12).toFixed(2)).replace(',', '.');


                                //Se o item verificado estiver disponível e não consta nas expressões removidas, salva no vetor
                                if (!expressoesRemovidas.some(v => productName.toUpperCase().includes(v.toUpperCase()))) {
                                    resultsInterno.arrayValues.push({
                                        Modelo: productName,
                                        ValorAV: parseFloat(productValue).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                                        ValorParc: parseFloat(productValueInstallments).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }),
                                        Loja: 'Terabyte',
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