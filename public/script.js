const buildTable = () => {
    fetch("Precos.json")
        .then(response => response.json())
        .then(mylist => {
            buildHtmlTable('#precos', mylist);
        });
}

// Monta a table HTML a partir do JSON
function buildHtmlTable(selector, myList) {
    //Adiciona os headers
    let columns = addAllColumnHeaders(myList, selector);
    const filtros = [];
    for (let checkboxesMarcadas of $('input[type=checkbox]:checked')) {
        filtros.push(checkboxesMarcadas.value);
    }

    //Para cada registro da lista
    for (var i = 0; i < myList.length; i++) {
        //Traz somente as placas do filtro, ou todas, caso marcado o checkbox de todas
        if (filtros.some(v => myList[i][columns[0]].includes(v)) || filtros.includes('todas') || i === 0) {
            let row$ = $('<tr/>');

            //Para cada coluna do registro, indo de 0 a 3 -> Modelo, valor a vista, valor parcelado, Loja. Próximo elemento seria o Link, que não é necessário
            for (let colIndex = 0; colIndex <= 3; colIndex++) {
                let cellValue;

                //Se for a primeira coluna, será o modelo onde é necessário adicionar o link
                if (colIndex === 0) {
                    cellValue = '<a href="' + myList[i][columns[4]] + '">' + myList[i][columns[colIndex]] + '</a>';
                    //Caso contrário, apenas adicionar o conteúdo em tela
                } else {
                    cellValue = myList[i][columns[colIndex]];
                }

                //See for nulo, adicionar string vazia
                if (cellValue == null) cellValue = "";

                //Dar append à row
                row$.append($('<td/>').html(cellValue));

                if (colIndex === 3 && myList[i][columns[colIndex]] === 'Amazon') {
                    row$.append($('<td/>').html('<a href="' + myList[i][columns[4]].replace('&tag=vgabrasil-20' , '').replace('www.', '') + '">' + 'Link </a>'));
                }

            }
            //Dar append ao objeto da table
            $(selector).append(row$);
        }
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
    headerTr$.append($('<th/>').html('Link sem afiliado'));

    //Dá append no header
    $(selector).append(headerTr$);

    //Retorn a informação das colunas
    return columnSet;
}


const deleteTable = () => {
    $('#precos').empty();
    buildTable();
}

$(document).ready(() => {
    $('#atualizarLista').on('click', () => {
        deleteTable();
    })

    setInterval(() => {
        $('#atualizarLista').click()
    }, 120000);
})
