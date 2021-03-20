const alerts = [];
let sinalSonoro = false;
const buildTable = () => {
    fetch("../Precos.json")
        .then(response => response.json())
        .then(mylist => {
            buildHtmlTable('#PrecosGPU', mylist);
        });
}

// Build the HTML table from the prices JSON
function buildHtmlTable(selector, myList) {
    //Add the headers
    let columns = addAllColumnHeaders(myList, selector);
    const filtros = [];
    for (let checkboxesMarcadas of $('.filterLeft input[type=checkbox]:checked')) {
        if (checkboxesMarcadas.value !== '3060') {
            filtros.push(new RegExp(formatName(checkboxesMarcadas.value), 'g'));
        } else if (checkboxesMarcadas.value === '3060') {
            filtros.push(new RegExp(formatName('3060[^ti]'), 'g'));
        }
    }

    let shouldAlert = false;
    sinalSonoro = $('#filtroSonoro').is(':checked');
    //For each record of the list
    for (var i = 0; i < myList.length; i++) {

        const formattedName = formatName(myList[i][columns[0]]);
        const todasChecked = $('#filtertodas:checked').length > 0;
        //Show only the records according to the user filter
        if (filtros.some(v => formattedName.match(v)) || todasChecked || i === 0) {

            if (alerts.some(v => {
                return formattedName.includes(v.Nome)
                    && formatValue(myList[i][columns[1]]) <= v.Valor
            })) {
                shouldAlert = true;
            }
            let row$ = $('<tr/>');

            //For each column of the record, add the fields to the screen
            for (let colIndex = 0; colIndex <= 3; colIndex++) {
                let cellValue;

                //If it's the first column, the link will be added
                if (colIndex === 0) {
                    cellValue = '<a href="' + myList[i][columns[4]] + '">' + myList[i][columns[colIndex]] + '</a>';
                //Otherwise, just add the content
            } else {
                    cellValue = myList[i][columns[colIndex]];
                }

                //If it's null, add an empty string
                if (cellValue == null) cellValue = "";

                //Append the row
                row$.append($('<td/>').html(cellValue));

            }
            //Append the table
            $(selector).append(row$);
        }
    }

    // If a match has been found with keyword and value, shown and message and if checked by the user play a sound.
    if (shouldAlert) {
        if (sinalSonoro) {
            document.getElementById('audioAlert').play();
        }
        alert('Um dos seus itens monitorados foi encontrado!');
    }

}

function addAllColumnHeaders(myList, selector) {
    var columnSet = [];
    var headerTr$ = $('<tr/>');

    //Grabs the first object from the JSON Array
    var rowHash = myList[0];
    //For each field of the object
    for (var key in rowHash) {
        //Add the field to the columnSet
        columnSet.push(key);
        //If the field is "Link" don't add as header because it'll be linked on the model
        if (key !== 'Link') {
            headerTr$.append($('<th/>').html(key));
        }
    }

    //Append to the header
    $(selector).append(headerTr$);

    //Return the columns info
    return columnSet;
}

//Remove all the records from the table
const deleteTable = () => {
    $('#PrecosGPU').empty();
}

//Format the value for the default use pattern
const formatValue = (value) => {
    return Number(value.replace('R$', '').replaceAll('.', '').replaceAll(',', '.'));
}

//Format the name for the default use pattern
const formatName = (name) => {
    return name.toUpperCase().replaceAll(' ', '');
}

//Create a new alert
const saveAlert = (name, value) => {
    alerts.push({
        Nome: formatName(name),
        Valor: value
    });
    $('#containerMonitoramento').append('<p><b>Palavra chave:</b> ' + name + '. <b>Valor:</b> ' + value + ' </p>');
}

//Read the URL params to create the default alerts
const readParams = () => {

    const url = new URL(window.location.href);

    let params = url.search;

    if (params) {
        params = params.replace('?', '');

        const paramsArray = params.split('&');

        for (let param of paramsArray) {
            const splittedParam = param.split('=');
            saveAlert(splittedParam[0], splittedParam[1]);
        }
    }
}

$(document).ready(() => {

    //Listener for clicking on the update button
    $('#atualizarLista').on('click', () => {
        deleteTable();
        buildTable();
    })

    //Listener for thew new alert button
    $('#criarAlerta').on('click', () => {

        //Gets the values filled by the user
        let nome = $('#filtrokeyWord').val();
        let valor = $('#filtroValue').val();

        //Creates the alert
        saveAlert(nome, valor);

        //Clear the fields on screen
        $('#filtrokeyWord').val('');
        $('#filtroValue').val('');

        // Gets the page URL
        let url = window.location.href;

        //Add the alert parameter to the URL
        if (url.indexOf('?') > -1) {
            url += '&' + nome + '=' + valor;
        } else {
            url += '?' + nome + '=' + valor;
        }

        // Updates the browser URL
        window.history.replaceState(null, null, url);

    })

    // Updates the list every 2 minutes
    setInterval(() => {
        $('#atualizarLista').click()
    }, 120000);

    //Loads the params saved on the URL
    readParams();

})
