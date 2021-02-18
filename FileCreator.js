const fs = require('fs');

async function createFile(results) {
    console.log("Call for create file");

    let dataForFile = JSON.stringify(results);

    if (dataForFile) {
        console.log("Creating the file.....");

        fs.writeFileSync('./public/Precos.json', dataForFile);

    }
}

module.exports = (JSONResults) => createFile(JSONResults);