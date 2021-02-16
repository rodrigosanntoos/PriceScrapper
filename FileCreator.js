const fs = require('fs');

async function createFile(results, filename) {
    console.log("Creating the file.....");

    let dataForFile = JSON.stringify(results);
    fs.writeFileSync('./public/json/' + filename + '.json', dataForFile);

    console.log("File created");
}

module.exports = (JSONResults, filename) => createFile(JSONResults, filename);