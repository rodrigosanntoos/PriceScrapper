const puppeteer = require('puppeteer');
let scrape = async () => {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    let hasResults = true;
    let i = 1;
    while (hasResults) {
        await page.goto('https://www.kabum.com.br/hardware/placa-de-video-vga?pagina=' + i + '&ordem=3&limite=100&prime=false&marcas=[]&tipo_produto=[]&filtro=[]');
        i++;
        hasResults = false;
        const query = await page.evaluate(() => {
            const results = { nomes: [], valores: [] };

            document.querySelectorAll('a.item-nome')
                .forEach((result) => results.nomes.push(result.innerText));

            document.querySelectorAll('div.qatGF')
                .forEach((result) => results.valores.push(result.innerText));

            console.log(results);
            return results;
        })
        browser.close()
        return query;
    }

    await browser.close();
};

scrape().then((value) => {
    for (let i = 0; i < value.nomes.length; i++) {
        if (value.nomes[i].includes('3070')) {
            console.log(value.nomes[i].concat(' -- Valor: ').concat(value.valores[i]));
        }
    }
})