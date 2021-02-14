const fs = require('fs');

async function createFile(results) {
    let dataForFile = JSON.stringify(results);
    fs.writeFileSync('Preços.json', dataForFile);
}

module.exports = (JSONResults) => createFile(JSONResults);