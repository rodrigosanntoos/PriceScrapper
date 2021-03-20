let sinalSonoro = false;
const buildTable = () => {
    fetch("../json/PrecosPSU.json")
        .then(response => response.json())
        .then(mylist => {
            buildHtmlTable('#PrecosPSU', mylist);
        });
}

// Build the HTML table from the prices JSON
function buildHtmlTable(selector, myList) {
    //Add the headers
    let columns = addAllColumnHeaders(myList, selector);
    let minWatts = $("#sliderWatts").slider("values", 0);
    let maxWatts = $("#sliderWatts").slider("values", 1);
    const filtros = [];
    for (let checkboxesMarcadas of $('input[type=checkbox]:checked')) {
        filtros.push(checkboxesMarcadas.value);
    }

    sinalSonoro = $('#filtroSonoro').is(':checked');
    //For each record of the list
    for (var i = 0; i < myList.length; i++) {

        //Show only the records according to the user filter
        if (
            (
                parseInt(myList[i][columns[5]].replace('W', '')) >= minWatts
                &&
                parseInt(myList[i][columns[5]].replace('W', '')) <= maxWatts
            )
            &&
            (
                filtros.some(v => myList[i][columns[0]].toLowerCase().includes(v))
                ||
                filtros.includes('todos')
            )
            ||
            i === 0
        ) {
            let row$ = $('<tr/>');

            //For each column of the record, add the fields to the screen. Skipping the index 4, which is th link
            for (let colIndex = 0; colIndex <= 5; colIndex++) {
                let cellValue;
                if (colIndex === 4) {
                    continue;
                }
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
    $('#PrecosPSU').empty();
}

$(() => {
    
    //Listener for clicking on the update button
    $('#atualizarLista').on('click', () => {
        deleteTable();
        buildTable();
    })

    // Updates the list every 2 minutes
    setInterval(() => {
        $('#atualizarLista').click()
    }, 120000);


    // Creates the slider for the Watts filter
    $("#sliderWatts").slider({
        range: true,
        min: 500,
        max: 2000,
        values: [750, 1500],
        slide: function (event, ui) {
            $("#wattsFilter").val(ui.values[0] + "W - " + ui.values[1] + "W");
        }
    });

    //Load the slider values on the screen when the page is loaded
    $("#wattsFilter").val($("#sliderWatts").slider("values", 0) +
        "W - " + $("#sliderWatts").slider("values", 1) + "W");
})