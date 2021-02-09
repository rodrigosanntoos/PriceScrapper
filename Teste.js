const puppeteer = require('puppeteer');
let scrape = async (pageNumber) => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto('https://www.kabum.com.br/hardware/placa-de-video-vga?pagina=' + pageNumber + '&ordem=3&limite=100&prime=false&marcas=[]&tipo_produto=[]&filtro=[]');

    const query = await page.evaluate(() => {
        const results = {
            arrayValues: [],
            foundUnavailable: false
        };

        document.querySelectorAll('div.jmuOAh').forEach((result) => {
            //isAvailable = Verifica se existem classes que indicam item indisponível
            const isAvailable = result.getElementsByClassName('jLtPVV').length === 0;

            //Se um item não está disponível, indica que é a última página de resultados
            if (!isAvailable) {
                results.foundUnavailable = true;
            }

            //Salva valores obtidos no HTML em variáveis para facilitar a reutilização
            const productName = result.getElementsByClassName('item-nome')[0].innerText;
            const productValue = result.getElementsByClassName('qatGF')[0].innerText;
            const productValueInstallments = result.getElementsByClassName('ksiZrQ')[0].innerText
            
            //Se o item verificado estiver disponível salva no vetor
            if (isAvailable) { //&&productName.includes(modeloPesquisa)
                results.arrayValues.push({
                    nome: productName,
                    valorParc: productValueInstallments,
                    valorAV: productValue
                });
            }
        });
        return results;
    })

    await browser.close();
    return query;

};


//Reformular totalmente, funciona para testes pelo menos
const doScrape = () => {
    scrape(i).then((value) => {
        i++;

        for (el of value.arrayValues) {
            console.log('Nome: ' + el.nome);
            console.log('Valor à vista: ' + el.valorAV);
            console.log('Valor à prazo: ' + el.valorParc);
            console.log('####################################################################################');
        }
        if (!value.foundUnavailable) {
            doScrape(i)
        }
    });
}

let i = 1;
doScrape();

