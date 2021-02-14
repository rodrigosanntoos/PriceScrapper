const browserObject = require('./Browser.js');
const scraperController = require('./pageController.js');
const createFile = require('./FileCreator.js');
const express = require('express')


const runTasks = () => {
    //Start the browser and create a browser instance
    let browserInstance = browserObject.startBrowser();

    // Pass the browser instance to the scraper controller
    scraperController(browserInstance).then((results) => {
        //Create the file with the results from the scraper
        createFile(results);
    });
}

var app = express();
app.use('/', express.static('public'));
app.listen(process.env.PORT || 8080);

runTasks();
setInterval(() => {
    runTasks();
}, 5 * 60 * 1000)

