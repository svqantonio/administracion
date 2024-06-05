var timer = 1500; var redirection = 'main.html';

var jsError_whtAuth = {
    "status" : "error",
    "message" : "No tienes autorización para acceder a estas tablas!",
    "timer" : timer,
    "redirection" : redirection
};

var jsError_notHappening = {
    "status" : "error",
    "message" : "La autorización a esta tabla está prohibida",
    "timer" : timer,
    "redirection" : redirection
};

document.addEventListener('DOMContentLoaded', function() {
    var token = localStorage.getItem('token');

    document.addEventListener('userDataReady', function (){
        var user_name = window.name;
        var user_role = window.role;

        loadAllTables(user_role);
        loadLogOutBtn(user_name, token);
    });
});

function loadAllTables(user_role) { //Función para cargar todas las tablas de la bbdd, luego le mandamos las tablas a la funcion de crear la tabla de todas las tablas de la bbdd
    var xhr = new XMLHttpRequest();
    xhr.open('GET', middleware + 'log.php?function=loadAllTables', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) 
            if (xhr.status === 200) 
                createTable_allBBDDTables(user_role, JSON.parse(xhr.responseText));
    };
    xhr.send();
} 

function createTable_allBBDDTables(user_role, response) { //Funcion para crear la tabla con todas las tablas de la bbdd, en esta funcion creamos toda la estructura de la tabla y la añadimos al body
    //Creamos toda la estructura de la tabla hasta el tbody y lo añadimos a la tabla 
    var table = document.createElement('table');
    var thead = document.createElement('thead');
    thead.style.border = '1px solid black';
    var tr = document.createElement('tr');
    var th = document.createElement('th');
    th.textContent = 'Tablas';
    var th_btnEdit = document.createElement('th');
    th_btnEdit.textContent = 'Acción 1';
    tr.appendChild(th);
    tr.appendChild(th_btnEdit);
    thead.appendChild(tr);
    table.appendChild(thead);
    
    //Aqui creamos el bloque del tbody
    var tbody = document.createElement('tbody');
    response.forEach(function(rspn) { //Con este for each lo que hago es crear todo el contenido de la tabla a partir del response que cogemos de loadAllTables()
        var tr_tbody = document.createElement('tr');
        var th = document.createElement('th');
        th.textContent = rspn.TABLE_NAME;
        var th_btnEdit = document.createElement('th');
        var btnEdit = document.createElement('button');
        btnEdit.textContent = 'Editar';
        if ((user_role == 1 && rspn.TABLE_NAME == 'tokens') || ((user_role != 1) && (rspn.TABLE_NAME == 'users' || rspn.TABLE_NAME == 'tokens' || rspn.TABLE_NAME == 'roles')))
            btnEdit.disabled = true;
        btnEdit.className = 'btn btn-link';

        btnEdit.onclick = function() {
            window.location.href = 'table.html?table=' + rspn.TABLE_NAME; //Con esta redirección mandamos a tables.html el nombre de la tabla a editar
        };

        //Añadimos toda la parte de los trs y tal al tbody
        tr_tbody.appendChild(th);
        tr_tbody.appendChild(th_btnEdit);
        th_btnEdit.appendChild(btnEdit);
        tbody.appendChild(tr_tbody);
        tbody.style.border = '1px solid black';
    });

    //Añadimos a la tabla el tbody y luego al documento añadimos la tabla 
    table.appendChild(tbody);
    document.body.appendChild(table);

    //Le damos un poco de diseño a la tabla para que no nos sangren los ojos
    table.classList = 'table table-success';
    table.style.display = 'flex';
    table.style.flexDirection = 'column';
    table.style.alignItems = 'center';
    table.style.marginTop = '10%';
}

function loadLogOutBtn(user_name, token) {
    var p = document.createElement('p');
    p.textContent = 'Bienvenido, ' + capitalizeFirstLetter(user_name) + '!  ';
    var btn = document.createElement('button');
    btn.className = 'btn btn-link';
    btn.textContent = 'Cerrar sesión';
    btn.onclick = function() { logOut(token); };
    p.style.position = 'fixed';
    p.style.top = '10px'; // Ajusta la distancia desde la parte superior
    p.style.right = '10px'; // Ajusta la distancia desde la derecha

    p.appendChild(btn);
    document.body.appendChild(p);
}

function logOut(token) {
    Swal.fire({
        title: "¿Estás seguro?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Cerrar sesión",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            var xhr = new XMLHttpRequest();
            xhr.open("POST", middleware + 'log.php?function=logOut&token=' + token, true);
            xhr.onreadystatechange = function() {
                if (xhr.readyState === XMLHttpRequest.DONE) {
                    if (xhr.status === 200) {
                        var response = JSON.parse(xhr.responseText);
                        if (response.status == 'success') {
                            swalNotificationAndLeave(response);
                        } else {
                            let rspn_cmbd_st = Object.assign({}, response, {'redirection' : 'main.html'});
                            let rspn_cmbd_js = JSON.stringify(rspn_cmbd_st);
                            swalNotificationAndLeave(rspn_cmbd_js);
                        }
                    }
                }
            };
            xhr.send();
        }
    });
}