const buildTable = () => {
    fetch("./json/PrecosPSU.json")
        .then(response => response.json())
        .then(mylist => {
            buildHtmlTable('#PrecosPSU', mylist);
        });
}

// Monta a table HTML a partir do JSON
function buildHtmlTable(selector, myList) {
    //Adiciona os headers
    let columns = addAllColumnHeaders(myList, selector);
    let minWatts = $("#sliderWatts").slider("values", 0);
    let maxWatts = $("#sliderWatts").slider("values", 1);
    const filtros = [];
    for (let checkboxesMarcadas of $('input[type=checkbox]:checked')) {
        filtros.push(checkboxesMarcadas.value);
    }

    //Para cada registro da lista
    for (var i = 0; i < myList.length; i++) {
        //Traz somente as placas do filtro, ou todas, caso marcado o checkbox de todas
        let row$ = $('<tr/>');


        if (
            (
                parseInt(myList[i][columns[4]]) >= minWatts
                &&
                parseInt(myList[i][columns[4]]) <= maxWatts
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
            //Para cada coluna do registro, indo de 0 a 3 -> Modelo, valor a vista, valor parcelado, Loja. Próximo elemento seria o Link, que não é necessário          
            for (let colIndex = 0; colIndex <= 4; colIndex++) {
                let cellValue;

                //Se for a primeira coluna, será o modelo onde é necessário adicionar o link
                if (colIndex === 0) {
                    cellValue = '<a href="' + myList[i][columns[5]] + '">' + myList[i][columns[colIndex]] + '</a>';
                    //Caso contrário, apenas adicionar o conteúdo em tela
                } else {
                    cellValue = myList[i][columns[colIndex]];
                }

                //See for nulo, adicionar string vazia
                if (cellValue == null) cellValue = "";

                //Dar append à row
                row$.append($('<td/>').html(cellValue));

            }
        }
        //Dar append ao objeto da table
        $(selector).append(row$);
    }
}

function addAllColumnHeaders(myList, selector) {
    var columnSet = [];
    var headerTr$ = $('<tr/>');

    //Pega o primeiro objeto do array de JSON
    var rowHash = myList[0];
    //Pra cada campo do objeto
    for (var key in rowHash) {
        //Adiciona o campo ao columnSet
        columnSet.push(key);
        //Se for o campo "Link", não adiciona como header pois será linkado no modelo
        if (key !== 'Link') {
            headerTr$.append($('<th/>').html(key));
        }
    }

    //Dá append no header
    $(selector).append(headerTr$);

    //Retorn a informação das colunas
    return columnSet;
}


const deleteTable = () => {
    $('#PrecosPSU').empty();
}

$(() => {
    $('#atualizarLista').on('click', () => {
        deleteTable();
        buildTable();
    })

    setInterval(() => {
        $('#atualizarLista').click()
    }, 120000);

    $("#sliderWatts").slider({
        range: true,
        min: 500,
        max: 2000,
        values: [500, 1500],
        slide: function (event, ui) {
            $("#wattsFilter").val(ui.values[0] + "W - " + ui.values[1] + "W");
        }
    });
    $("#wattsFilter").val($("#sliderWatts").slider("values", 0) +
        "W - " + $("#sliderWatts").slider("values", 1) + "W");
})
