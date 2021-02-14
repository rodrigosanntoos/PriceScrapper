const browserObject = require('./Browser.js');
const scraperController = require('./pageController.js');
const createFile = require('./FileCreator.js');
const app = require('express')();

const runTasks = () => {
    //Start the browser and create a browser instance
    let browserInstance = browserObject.startBrowser();

    // Pass the browser instance to the scraper controller
    scraperController(browserInstance).then((results) => {
        //Create the file with the results from the scraper
        createFile(results);
    });
}

const port = process.env.PORT || 3000;
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/Index.html');
});
app.listen(port, function() {
  console.log("Node app is running at localhost:" + app.get('port'))
});

runTasks();
setInterval(() => {
    runTasks();
}, 5 * 60 * 1000)

