const browserObject = require('./Browser.js');
const scraperControllerGPU = require('./pageControllerGPU.js');
const scraperControllerPSU = require('./pageControllerPSU.js');
const createFile = require('./FileCreator.js');
const express = require('express')


const runTasks = async (lastTimeout) => {
    //Start the browser and create a browser instance
    let browserInstance = browserObject.startBrowser();

    // Pass the browser instance to the scraper controller
    scraperControllerPSU(browserInstance).then((resultsPSU) => {
        //Create the file with the results from the scraper
        createFile(resultsPSU, 'PrecosPSU');

        scraperControllerGPU(browserInstance).then((resultsGPU) => {
            //Create the file with the results from the scraper
            createFile(resultsGPU, 'PrecosGPU');
        });
    });


    //Gera um novo timeout de até 10 minutos
    let newTimeout = Math.random() * 1000 * 600;

    //Se o último timeout foi superior à 4min, e esse também é: Reduz o novo pela metade
    if (lastTimeout > 240000 && newTimeout > 240000) {
        newTimeout = newTimeout / 2;
    };

    //Roda a function novamente após o timeout
    setTimeout(() => {
        runTasks(newTimeout);
    }, newTimeout);

}

var app = express();
app.use('/', express.static('public'));
app.listen(process.env.PORT || 8080);

runTasks(0);

