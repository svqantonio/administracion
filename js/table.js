var folder = getFolderName() + '/middleware/';

var parameters = new URLSearchParams(window.location.search);
var table = parameters.get('table');
var token = localStorage.getItem('token');
var fileName = window.location.href.split('/').pop().split('?')[0];
var formBoolean = false;
//console.log("filename: ", fileName);

document.addEventListener('DOMContentLoaded', function() {
    if (fileName.includes('table.html')) {
        loadTableStructure(table);
    } else if (fileName.includes('table_edit.html')) {
        getTableStructure(table)
        .then(response => {
            let data = getJsonFromUrlParams();
            //console.log("Response: ", response);
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
    formEdit.innerHTML = ''; // Limpiamos el formulario antes de construirlo
    var h3 = document.createElement('h3'); //Un h3 para explicar que estamos haciendo
    h3.textContent = 'Formulario de edición de la tabla: ' + table;
    formEdit.appendChild(h3);

    tableStructure.forEach(function(column) { //Recorremos el json de la estructura de la tabla
        var div = document.createElement('div');
        div.className = 'mb-3';
        var label = document.createElement('label');
        label.className = 'form-label';
        label.textContent = capitalizeFirstLetter(column.COLUMN_NAME) + ":";

        var inputOrSelect;
        if (column.REFERENCED_COLUMN_NAME != '') {
            var select = document.createElement('select');
            select.className = 'form-select';
            select.name = column.COLUMN_NAME;

            if (column.IS_NULLABLE == 'NO')
                select.required = true;

            var xhr = new XMLHttpRequest();
            xhr.open('GET', middleware + 'tables.php?function=getFkData&table=' + column.COLUMN_NAME, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status === 200) {
                        var response = JSON.parse(xhr.responseText);
                        response.forEach(function(item) {
                            var option = document.createElement('option');
                            option.value = item.id;
                            option.textContent = capitalizeFirstLetter(item.type);
                            if (data[column.COLUMN_NAME] == item.id)
                                option.selected = true;
                            select.appendChild(option);
                        });
                    }
                }
            };
            xhr.send();
            inputOrSelect = select;
        } else {
            var input = document.createElement('input');
            input.className = 'form-control';
            input.name = column.COLUMN_NAME;

            if (column.IS_NULLABLE == 'NO') 
                input.required = true;

            if (column.COLUMN_TYPE.includes('int')) {
                input.type = 'number';
                input.value = data[column.COLUMN_NAME];
                if (column.EXTRA != '')
                    input.readOnly = true;
            } else if (column.COLUMN_TYPE.includes('varchar')) {
                input.type = 'text';
                input.value = data[column.COLUMN_NAME];
            }
            inputOrSelect = input;
        }

        div.appendChild(label);
        div.appendChild(inputOrSelect);
        formEdit.appendChild(div);
    });

    var button = document.createElement('button');
    button.type = 'submit';
    button.className = 'btn btn-outline-primary';
    button.textContent = 'Editar';
    formEdit.appendChild(button);

    formEdit.onsubmit = function() { 
        return addOrEditValue(tableStructure, 'edit', formEdit, table);
    };
}

function buildFormNew(tableStructure, table) {
    var formNew = document.getElementById('formNew');
    formNew.innerHTML = ''; // Limpiamos el formulario antes de construirlo
    var h3 = document.createElement('h3');
    h3.textContent = 'Formulario de creación de datos para la tabla: ' + table;
    formNew.appendChild(h3);

    tableStructure.forEach(function(column) {
        if (column.COLUMN_NAME != 'id') {
            var div = document.createElement('div');
            div.className = 'mb-3';
            var label = document.createElement('label');
            label.className = 'form-label';
            label.textContent = capitalizeFirstLetter(column.COLUMN_NAME) + ":";

            if (column.REFERENCED_COLUMN_NAME != '') {
                var select = document.createElement('select');
                select.className = 'form-select';
                select.name = column.COLUMN_NAME;

                if (column.IS_NULLABLE == 'NO') 
                    select.required = true;

                var xhr = new XMLHttpRequest(); // Petición para obtener los datos de la tabla ajena
                xhr.open('GET', middleware + 'tables.php?function=getFkData&table=' + column.COLUMN_NAME, true);
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === XMLHttpRequest.DONE) {
                        if (xhr.status === 200) {
                            var response = JSON.parse(xhr.responseText);
                            var option = document.createElement('option');
                            option.value = 0;
                            option.selected = true;
                            option.disabled = true;
                            option.textContent = "Seleccione una opción";
                            select.appendChild(option);
                            response.forEach(function(item) {
                                var option = document.createElement('option');
                                option.value = item.id;
                                option.textContent = capitalizeFirstLetter(item.type);
                                select.appendChild(option);
                            });
                        }
                    }
                };
                xhr.send();

                div.appendChild(label);
                div.appendChild(select);
                formNew.appendChild(div);
            } else {
                var input = document.createElement('input');
                input.className = 'form-control';
                input.name = column.COLUMN_NAME;

                if (column.IS_NULLABLE == 'NO') 
                    input.required = true;

                if (column.COLUMN_TYPE.includes('int') && column.COLUMN_NAME != 'id') {
                    input.type = 'number';
                } else if (column.COLUMN_TYPE.includes('varchar')) {
                    input.type = 'text';
                    if (column.COLUMN_NAME == 'username') {
                        input.addEventListener('input', function(event) {
                            this.value = this.value.replace(/\s/g, '');
                        });
                    }
                }
                div.appendChild(label);
                div.appendChild(input);
                formNew.appendChild(div);
            }
        }
    });

    var btnAdd = document.createElement('button');
    btnAdd.type = 'button';
    btnAdd.className = 'btn btn-outline-primary';
    btnAdd.textContent = 'Añadir';
    btnAdd.onclick = function() { return addOrEditValue(tableStructure, 'new', formNew, table) };
    formNew.appendChild(btnAdd);
    formNew.style.display = 'block';
}

function changeFormNewDisplay() {
    if (!formBoolean) {
        getTableStructure(table)
        .then(response => {
            buildFormNew(response, table);
        })  
        .catch(error => {
            console.log(error);
        });
    } else {
        document.getElementById('formNew').style.display = 'none';
    }
    formBoolean = !formBoolean;
}

function addOrEditValue(tableStructure, type, formEdit, table) {
    var jsonData = {}; 
    tableStructure.forEach(function(column) {
        var inputValue = formEdit.querySelector('[name="' + column.COLUMN_NAME + '"]');
        if (inputValue) {
            jsonData[column.COLUMN_NAME] = inputValue.value;
        } else {
            console.error('No se encontró ningún elemento con el nombre de columna: ' + column.COLUMN_NAME);
        }
    });

    Swal.fire({
        title: "¿Estás seguro de que quieres " + type + " estos valores?",
        icon: "question",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: type,
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            var xhr = new XMLHttpRequest();
            if (type == 'edit') 
                xhr.open('POST', middleware + 'tables.php?function=editValues&table=' + table, true);
            else    
                xhr.open('POST', middleware + 'tables.php?function=newValue&table=' + table, true);
            xhr.setRequestHeader('Content-type', 'application/json');
            xhr.onreadystatechange = function() {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status === 200) {
                        swalNotificationAndLeave(JSON.parse(xhr.responseText));
                    }
                }
            };
            xhr.send(JSON.stringify(jsonData));
        }
    });
return false; // Para evitar que el formulario se envíe de la forma tradicional     
}