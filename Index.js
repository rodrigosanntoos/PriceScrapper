const browserObject = require('./Browser.js');
const scraperControllerGPU = require('./pageControllerGPU.js');
const scraperControllerPSU = require('./pageControllerPSU.js');

const createFile = require('./FileCreator.js');
const express = require('express')


const runTasks = (lastTimeout, ieType) => {
    //Start the browser and create a browser instance
    let browserInstance = browserObject.startBrowser();

    if (ieType === 1) {
        console.log('Updating GPUs');
        // Pass the browser instance to the scraper controller
        scraperControllerGPU(browserInstance).then((resultsGPU) => {
            //Create the file with the results from the scraper
            createFile(resultsGPU, 'PrecosGPU');
        });
        ieType = 2;
    } else if (ieType === 2) {
        console.log('Updating PSUs');

        // Pass the browser instance to the scraper controller
        scraperControllerPSU(browserInstance).then((resultsPSU) => {
            //Create the file with the results from the scraper
            createFile(resultsPSU, 'PrecosPSU');
        });
        ieType = 1;
    }

    //Gera um novo timeout de até 7 minutos
    let newTimeout = Math.random() * 1000 * 420;

    //Se o último timeout foi superior à 5min, e esse também é: Reduz o novo pela metade
    if (lastTimeout > 300000 && newTimeout > 300000) {
        newTimeout = newTimeout / 2;
    };

    //Adiciona um minuto sempre, para não ter updates muito rápidos que buguem por causa da GPU/PSU
    newTimeout = newTimeout + 60000;
    
    //Roda a function novamente após o timeout
    setTimeout(() => {
        runTasks(newTimeout, ieType);
    }, newTimeout);

}

var app = express();
app.use('/', express.static('public'));
app.listen(process.env.PORT || 8080);

runTasks(0, 1);

