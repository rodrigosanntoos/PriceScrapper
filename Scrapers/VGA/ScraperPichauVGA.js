const scraperObject = {
  url:
    "https://www.pichau.com.br/hardware/placa-de-video?product_list_limit=48&product_list_order=price",
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
        await page.waitForSelector(".products-grid");
        // Loop through the results and get the description + value
        let getPrices = (link) =>
          new Promise(async (resolve, reject) => {
            let results = await page.evaluate((resolve, reject) => {
              const resultsInterno = {
                arrayValues: [],
                foundUnavailable: false,
              };
              document.querySelectorAll(".product-item").forEach((result) => {
                //isAvailable = Check if there are any classes indicating an item not available
                const isAvailable =
                  result.getElementsByClassName("unavailable").length === 0;
                const expressoesRemovidas = [
                  "Quadro",
                  "Osprey",
                  "Conferencia",
                  "Titan",
                  "Expansora",
                  "Screen Share",
                  "Radeon Pro",
                  "Microfone",
                  "Suporte",
                  "GT 710",
                  "GT 730",
                  "R5 2020",
                  "Cabo de extensão",
                  "G210",
                  "R7 240",
                  "GT 1030",
                  " 1GB",
                  " 2GB",
                  " 3GB",
                  " 4GB",
                  "1050Ti",
                  "1050",
                  "RX 550 ",
                  "Case para",
                  "Conferência",
                ];

                //If an item is not available, indicates it is the last page of results
                if (!isAvailable) {
                  resultsInterno.foundUnavailable = true;
                } else {
                  //Save the HTML values on variables
                  const productName = result.getElementsByClassName(
                    "product-item-link"
                  )[0].innerText;
                  const productValueString = result
                    .getElementsByClassName("price-boleto")[0]
                    .getElementsByTagName("span")[0].innerText;
                  const productValueInstallmentsString = result.getElementsByClassName(
                    "price-installments"
                  )[0].innerText;
                  const productLink = result
                    .getElementsByClassName("product-item-link")[0]
                    .getAttribute("href");

                  const productValue = productValueString
                    .replace("à vista", "")
                    .replace("R$", "")
                    .replace(".", "")
                    .replace(",", ".");
                  const productValueInstallments = String(
                    (
                      parseFloat(
                        productValueInstallmentsString
                          .replace("10x de R$", "")
                          .replace(".", "")
                      ) * 10
                    ).toFixed(2)
                  );

                  //If the item is not ignored according to the keywords, add to the array
                  if (
                    !expressoesRemovidas.some((v) =>
                      productName.toUpperCase().includes(v.toUpperCase())
                    )
                  ) {
                    resultsInterno.arrayValues.push({
                      Modelo: productName,
                      ValorAV: parseFloat(productValue).toLocaleString(
                        "pt-BR",
                        { style: "currency", currency: "BRL" }
                      ),
                      ValorParc: parseFloat(
                        productValueInstallments
                      ).toLocaleString("pt-BR", {
                        style: "currency",
                        currency: "BRL",
                      }),
                      Loja: "Pichau",
                      Link: productLink,
                    });
                  }
                }
              });
              return resultsInterno;
            });
            resolve(results);
          });

        let infoFromPage = await getPrices();
        scrapedData = scrapedData.concat(infoFromPage.arrayValues);
        hasNextPage = !infoFromPage.foundUnavailable;

        if (hasNextPage) {
          await page.click(".next");
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
  },
};

module.exports = scraperObject;
