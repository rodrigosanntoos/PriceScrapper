const scraperObject = {
  url: "https://www.fgtec.com.br/placa-de-video-125?page=1",
  async scraper(browser) {
    let page = await browser.newPage();
    console.log(`Navigating to ${this.url}...`);
    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/88.0.4324.150 Safari/537.36"
    );
    // Navigate to the selected page
    await page.goto(this.url);
    let scrapedData = [];
    // Wait for the required DOM to be rendered
    async function scrapeCurrentPage() {
      try {
        await page.waitForSelector(".hook--main-content--products");
        // Loop through the results and get the description + value
        let getPrices = (link) =>
          new Promise(async (resolve, reject) => {
            let results = await page.evaluate((resolve, reject) => {
              const resultsInterno = {
                arrayValues: [],
                foundUnavailable: false,
              };
              document
                .querySelectorAll(".products__list__item")
                .forEach((result) => {
                  //isAvailable = Check if there are any classes indicating an item not available
                  const isAvailable =
                    result.getElementsByClassName("button--out-of-stock")
                      .length === 0;
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
                    const productName = result
                      .getElementsByClassName("product-card__title")[0]
                      .getElementsByTagName("span")[0].innerText;
                    const productValue = result
                      .getElementsByClassName("product-card__price__final")[0]
                      .getElementsByClassName("price")[0]
                      .innerText.replace("R$", "")
                      .replace(".", "")
                      .replace(",", ".");
                    const productValueInstallments = result
                      .getElementsByClassName(
                        "product-card__price__installment"
                      )[0]
                      .getElementsByTagName("span")[0]
                      .getElementsByClassName("text")[0]
                      .innerText.replace("R$", "")
                      .replace(".", "")
                      .replace(",", ".")
                      .replace("ou", "");
                    const productLink = result
                      .getElementsByClassName("product-card__buy-button")[0]
                      .getElementsByTagName("a")[0]
                      .getAttribute("href");

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
                          {
                            style: "currency",
                            currency: "BRL",
                          }
                        ),
                        ValorParc: parseFloat(
                          productValueInstallments
                        ).toLocaleString("pt-BR", {
                          style: "currency",
                          currency: "BRL",
                        }),
                        Loja: "FGTec",
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
          await page.click(".products__nav__item--next a");
          return scrapeCurrentPage(); // Call this function recursively
        }
      } catch {
        return scrapedData;
      } finally {
        await page.close();
        return scrapedData;
      }
    }
    let data = await scrapeCurrentPage();
    return data;
  },
};

module.exports = scraperObject;
