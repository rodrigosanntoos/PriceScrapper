const browserObject = require('./browser');
const scraperController = require('./pageController');
const createFile = require('./FileCreator');

const runTasks = () => {
    //Start the browser and create a browser instance
    let browserInstance = browserObject.startBrowser();

    // Pass the browser instance to the scraper controller
    scraperController(browserInstance).then((results) => {
        //Create the file with the results from the scraper
        createFile(results);
    });
}
runTasks();
setInterval(() => {
    runTasks();
}, 5 * 60 * 1000)

