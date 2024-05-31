var folder = getFolderName() + '/middleware/';

var parameters = new URLSearchParams(window.location.search);
var table = parameters.get('table');
var token = localStorage.getItem('token');
var fileName = window.location.href.split('/').pop().split('?')[0];
//console.log("filename: ", fileName);

document.addEventListener('DOMContentLoaded', function() {
    if (fileName.includes('table.html')) {
        loadTableStructure(table);
    } else if (fileName.includes('table_edit.html')) {
        getTableStructure(table)
        .then(response => {
            let data = getJsonFromUrlParams();
            console.log("Response: ", response);
            buildFormEdit(response, data, table);
        })
        .catch(error => {
            console.error(error);
        });
    }
});

function getJsonFromUrlParams() {
    let params = {};
    window.location.search.substring(1).split('&').forEach(param => {
        let [key, value] = param.split('=');
        params[key] = decodeURIComponent(value);
    });
    let encodedJsonString = params.data;
    let jsonString = decodeURIComponent(encodedJsonString);
    let jsonObj = JSON.parse(jsonString);
    return jsonObj;
}

function loadTableStructure(tbl) { //
    var xhr = new XMLHttpRequest();
    xhr.open("GET", middleware + "tables.php?function=loadNumberFields&table=" + tbl, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                var response = JSON.parse(xhr.responseText);

                var table = document.createElement('table');
                table.classList = 'table table-success';
                var thead = document.createElement('thead');
                thead.style.border = '1px solid black';
                var tr = document.createElement('tr');

                response.forEach(function(rspn) { //Creamos los th en funcion del numero de campos de una tabla
                    var th = document.createElement('th');
                    th.textContent = rspn.COLUMN_NAME;
                    tr.appendChild(th);
                });


                var th_edit = document.createElement('th');
                th_edit.textContent = 'Acción 1';
                tr.appendChild(th_edit);
                
                var th_dlt = document.createElement('th');
                th_dlt.textContent = 'Acción 2';
                tr.appendChild(th_dlt);

                thead.appendChild(tr);
                table.appendChild(thead);
                var tbody = document.createElement('tbody');
                tbody.style.border = '1px solid black';
                table.appendChild(tbody);
                var div = document.querySelector(".container");
                div.appendChild(table);
                //document.body.appendChild(table);

                var scd_xhr = new XMLHttpRequest();
                scd_xhr.open('GET', middleware + 'tables.php?function=loadTableContent&table=' + tbl, true);
                scd_xhr.onreadystatechange = function() {
                    if (scd_xhr.readyState === XMLHttpRequest.DONE) {
                        if (scd_xhr.status === 200) {
                            var tableData = JSON.parse(scd_xhr.responseText);
                            var tableFields = response;
                            loadData_specificTable(tableFields, tableData, tbody);
                        }
                    }
                };
                scd_xhr.send();                
            }
        }
    };
    xhr.send();
}

function loadData_specificTable(tableFields, tableData, tbody) {
    tableData.forEach(function(row) {
        var tr = document.createElement('tr');
        tableFields.forEach(function(column) {
            var td = document.createElement('td');
            if (column.COLUMN_NAME == 'password')
                td.textContent = '***********';    
            else if (column.COLUMN_NAME == 'role')
                td.textContent = capitalizeFirstLetter(row[column.COLUMN_NAME]);
            else if (column.COLUMN_NAME == 'name')
                td.textContent = capitalizeFirstLetter(row[column.COLUMN_NAME]);
            else
                td.textContent = row[column.COLUMN_NAME];
            
            tr.appendChild(td);
        });

        var editTd = document.createElement('td');
        var editBtn = document.createElement('button');
        editBtn.textContent = 'Editar';
        editBtn.classList = 'btn btn-link';
        editBtn.onclick = function() {
            // Convertir el objeto a una cadena JSON
            let jsonString = JSON.stringify(row);
            let encodedJsonString = encodeURIComponent(jsonString);
            let url = `table_edit.html?table=${table}&data=${encodedJsonString}`;
            window.location.href = url;
        };

        var dltTd = document.createElement('td');
        var dltBtn = document.createElement('button');
        dltBtn.textContent = 'Borrar';
        dltBtn.classList = 'btn btn-outline-danger';
        dltBtn.onclick = function() {
            Swal.fire({
                title: "¿Estás seguro de que quieres borrar el valor?",
                text: "Vas a borrar el registro: " + row.name,
                icon: "warning",
                showCancelButton: true,
                confirmButtonColor: "#3085d6",
                cancelButtonColor: "#d33",
                confirmButtonText: "Borrar",
                cancelButtonText: "Cancelar"
              }).then((result) => {
                if (result.isConfirmed) {
                  var xhr = new XMLHttpRequest();
                  xhr.open('POST', middleware + 'tables.php?function=deleteValue&table=' + table + '&id=' + row.id + '&token=' + token, true);
                  xhr.onreadystatechange = function() {
                    if (xhr.readyState === XMLHttpRequest.DONE) {
                        if (xhr.status === 200) {
                            swalNotificationAndLeave(JSON.parse(xhr.responseText));
                        }
                    }
                  };
                  xhr.send();
                }
              });
        };
        editTd.appendChild(editBtn);
        dltTd.appendChild(dltBtn);
        tr.appendChild(editTd);
        tr.appendChild(dltTd);
        tbody.appendChild(tr);
    });
}

function getTableStructure(table) {
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', middleware + 'tables.php?function=getTableStructure&table=' + table, true);
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    var response = JSON.parse(xhr.responseText);
                    resolve(response);
                } else {
                    reject('Hubo un segundo error');
                }
            }
        };
        xhr.send();
    });
}   

function buildFormEdit(tableStructure, data, table) { //Funcion para crear el formulario dependiendo de la estructura de la tabla
    var formEdit = document.getElementsByClassName('formEdit')[0]; //En caso de estar dentro de table_edit.html coge el formEdit
    var h3 = document.createElement('h3'); //Un h3 para explicar que estamos haciendo
    h3.textContent = 'Formulario de edición de la tabla: ' + table;
    formEdit.appendChild(h3);
    // console.log("Table structure: ", tableStructure);
    // console.log("Data: ", data);
    for (row in data) { //Recorremos el json de los datos
        tableStructure.forEach(function(column) { //Recorremos el json de la estructura de la tabla
            var div = document.createElement('div'); //Creamos el div para meterle dentro el label e input
            div.className = 'mb-3';
            if (row == column.COLUMN_NAME) { //Esto busca que coincida el dato que vamos a meter en el formulario con la estructura de la tabla, para poder hacer comprobaciones y crear distintos inputs o selects en caso de ser clave ajena
                var label = document.createElement('label');
                label.className = 'form-label';
                label.textContent = capitalizeFirstLetter(column.COLUMN_NAME) + ":"; //Le metemos al label el nombre de la estructura de la tabla que corresponda

                if (column.REFERENCED_COLUMN_NAME != '') { //Referenced_column_name es la propiedad que te indica si es una clave ajena
                    var type_row = data[row]; //Esto lo hago porque data[row] es una valor que no se porque en un momento varia y necesito esta variable para compararla mas abajo
                    var select = document.createElement('select');
                    select.className = 'form-select';
                    select.name = column.COLUMN_NAME; //No funciona si no le pones el name porque no puede coger el valor del select

                    var xhr = new XMLHttpRequest(); //Peticion para pedirle al tableHelper los datos de la tabla ajena
                    xhr.open('GET', middleware + 'tables.php?function=getFkData&table=' + column.COLUMN_NAME, true);
                    xhr.onreadystatechange = function() {
                        if (xhr.readyState === XMLHttpRequest.DONE) {
                            if (xhr.status === 200) { //Si la peticion esta hecha correctamente, crea los options y luego al que coincida con el valor que tenemos en los datos que recibimos del valor que queremos editar, le metemos option.selected = true
                                var response = JSON.parse(xhr.responseText);
                                for (i=0; i < response.length; i++) {
                                    var option = document.createElement('option');
                                    option.value = response[i].id;
                                    option.textContent = capitalizeFirstLetter(response[i].type);
                                    if (type_row == response[i].type)
                                        option.selected = true;
                                    
                                    select.appendChild(option); //Añadimos el option al select
                                }
                            }
                        }
                    };
                    xhr.send();

                    div.appendChild(label);
                    div.appendChild(select);
                    formEdit.appendChild(div);
                } else { //Si no es una clave ajena, input normal
                    var input = document.createElement('input');
                    input.className = 'form-control';
                    input.name = column.COLUMN_NAME;
    
                    if (column.COLUMN_TYPE.includes('int')) {
                        input.type = 'number';
                        input.value = data[row];
                        if (column.EXTRA != '') //Propiedad de los autoincrementables, esto evidentemente no se puede cambiar
                            input.readOnly = true;
                    } else if (column.COLUMN_TYPE.includes('varchar')) {
                        input.type = 'text';
                        input.value = data[row];
                    }
    
                    div.appendChild(label);
                    div.appendChild(input);
                    formEdit.appendChild(div);
                }
            }
        });
    }
    
    var button = document.createElement('button');
    button.type = 'button';
    button.className = 'btn btn-outline-primary';
    button.textContent = 'Editar';
    button.onclick = function() {
        var jsonData = {}; 
        for (var i = 0; i < tableStructure.length; i++) {
            var columnName = tableStructure[i].COLUMN_NAME;
            var inputValue = formEdit.querySelector('[name="' + columnName + '"]');
            if (inputValue)
                jsonData[columnName] = inputValue.value;
            else
                console.error('No se encontró ningún elemento con el nombre de columna: ' + columnName);
        }
        //console.log("Json a mandar al php: ", jsonData);

        var xhr = new XMLHttpRequest();
        xhr.open('POST', middleware + 'tables.php?function=editValues&table=' + table, true);
        xhr.setRequestHeader('Content-type', 'application/json');
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) {
                    swalNotificationAndLeave(JSON.parse(xhr.responseText));
                }
            }
        };
        xhr.send(JSON.stringify(jsonData));
        return false;
    };
    formEdit.appendChild(button);
}

function buildFormNew(tableStructure, table) {
    var formNew = document.getElementById('formNew');
    var h3 = document.createElement('h3');
    h3.textContent = 'Formulario de creación de datos para la tabla: ' + table;
    formNew.appendChild(h3);
    //console.log("Estructura de la tabla: ", tableStructure);

    tableStructure.forEach(function(column) {
        //console.log("Column: ", column);
        if (column.REFERENCED_COLUMN_NAME != '') {
            var div = document.createElement('div');
            div.className = 'mb-3';
            var label = document.createElement('label');
            label.textContent = capitalizeFirstLetter(column.COLUMN_NAME) + ":";
            label.className = 'form-label';
            var select = document.createElement('select');
            select.className = 'form-select';
            select.name = column.COLUMN_NAME; //No funciona si no le pones el name porque no puede coger el valor del select

            var xhr = new XMLHttpRequest(); //Peticion para pedirle al tableHelper los datos de la tabla ajena
            xhr.open('GET', middleware + 'tables.php?function=getFkData&table=' + column.COLUMN_NAME, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status === 200) { //Si la peticion esta hecha correctamente, crea los options y luego al que coincida con el valor que tenemos en los datos que recibimos del valor que queremos editar, le metemos option.selected = true
                        var response = JSON.parse(xhr.responseText);
                        var option = document.createElement('option');
                        option.value = 0;
                        option.textContent = "Seleccione una opción";
                        select.appendChild(option);
                        for (i=0; i < response.length; i++) {
                            var option = document.createElement('option');
                            option.value = response[i].id;
                            option.textContent = capitalizeFirstLetter(response[i].type);

                            select.appendChild(option); //Añadimos el option al select
                        }
                    }
                }
            };
            xhr.send();
            var div_validation = document.createElement('div'); 
            div_validation.className = 'invalid-feedback';
            div_validation.textContent = 'No puedes dejar el select vacío';

            div.appendChild(label);
            div.appendChild(select);
            div.appendChild(div_validation);
            formNew.appendChild(div);
        } else if (column.COLUMN_TYPE == 'varchar(255)') {
            var div = document.createElement('div');
            div.className = 'mb-3';
            var label = document.createElement('label');
            label.textContent = capitalizeFirstLetter(column.COLUMN_NAME) + ":";
            label.className = 'form-label';
            var input = document.createElement('input');
            input.type = 'text';
            input.name = column.COLUMN_NAME;
            input.className = 'form-control';

            if (column.COLUMN_NAME == 'username') { // Añadir evento para evitar espacios en el campo 'username'
                input.addEventListener('input', function(event) {
                    this.value = this.value.replace(/\s/g, '');
                });
            }

            var div_validation = document.createElement('div');
            div_validation.className = 'invalid-feedback';
            div_validation.textContent = 'No puedes dejar vacío el campo: ' + capitalizeFirstLetter(column.COLUMN_NAME);

            div.appendChild(label);
            div.appendChild(input);
            div.appendChild(div_validation);
            formNew.appendChild(div);   
        }
    });
    
    var btnAdd = document.createElement('button');
    btnAdd.type = 'button';
    btnAdd.className = 'btn btn-outline-primary';
    btnAdd.textContent = 'Añadir';
    btnAdd.onclick = function() {
        var jsonData = {}; 
        for (var i = 0; i < tableStructure.length; i++) {
            var columnName = tableStructure[i].COLUMN_NAME;
            var inputValue = formNew.querySelector('[name="' + columnName + '"]');
            if (inputValue)
                jsonData[columnName] = inputValue.value;
            else
                console.error('No se encontró ningún elemento con el nombre de columna: ' + columnName);
        }
        console.log("Json a mandar al php: ", jsonData);

        Swal.fire({
            title: "¿Estás seguro de que quieres añadir estos valores?",
            icon: "question",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Añadir",
            cancelButtonText: "Cancelar"
          }).then((result) => {
            if (result.isConfirmed) {
                var xhr = new XMLHttpRequest();
                xhr.open('POST', middleware + 'tables.php?function=newValue&table=' + table, true);
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === XMLHttpRequest.DONE)
                        if (xhr.status === 200) 
                            swalNotificationAndLeave(JSON.parse(xhr.responseText));
                        
                }
                xhr.send(JSON.stringify(jsonData)); 
            }
          });
    };
    formNew.appendChild(btnAdd);

    formNew.style.display = 'block';
    return false;
}

function changeFormNewDisplay() {
    getTableStructure(table)
    .then(response => {
        buildFormNew(response, table);
    })  
    .catch(error => {
        console.log(error);
    });
}