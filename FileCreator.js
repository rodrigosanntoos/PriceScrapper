const fs = require('fs');

async function createFile(results) {
    console.log("Creating the file.....");

    let dataForFile = JSON.stringify(results);
    fs.writeFileSync('Precos.json', dataForFile);
}

module.exports = (JSONResults) => createFile(JSONResults);