const browserObject = require('./Browser.js');
const scraperController = require('./pageController.js');
const createFile = require('./FileCreator.js');
const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000


const runTasks = () => {
    //Start the browser and create a browser instance
    let browserInstance = browserObject.startBrowser();

    // Pass the browser instance to the scraper controller
    scraperController(browserInstance).then((results) => {
        //Create the file with the results from the scraper
        createFile(results);
    });
}

express()
  .use(express.static(path.join(__dirname, 'public')))
  .set('views', path.join(__dirname, 'views'))
  .set('view engine', 'ejs')
  .get('/', (req, res) => res.render('pages/index'))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
  
runTasks();
setInterval(() => {
    runTasks();
}, 5 * 60 * 1000)

