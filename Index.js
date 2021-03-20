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
        }).catch(() => {
            console.log('Error on file creation - Inside')
        });
    }).catch(() => {
        console.log('Error on file creation - Outside');
    });


    //Generate a new timeout of up to 10 minutes
    let newTimeout = Math.random() * 1000 * 600;

    //If both the last and current timeouts were over 4 minutes, reduce the current timeout time in half
    if (lastTimeout > 240000 && newTimeout > 240000) {
        newTimeout = newTimeout / 2;
    };

    //Runs the funciton again after the timeout
    setTimeout(() => {
        runTasks(newTimeout);
    }, newTimeout);

}

var app = express();
app.use('/', express.static('public'));
app.listen(process.env.PORT || 8080);

runTasks(0);

