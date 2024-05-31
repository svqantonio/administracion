var timer = 1500;

var jsError_notLogued = {
    "status" : "error",
    "message" : "No estás logueado!",
    "timer" : timer,
    "redirection" : "index.html"
};

var jsError_alrLogued = {
    "status" : "error",
    "message" : "Ya estás logueado!",
    "timer" : timer,
    "redirection" : "main.html"
};

var middleware = getFolderName() + "/middleware/";

document.addEventListener('DOMContentLoaded', function() {
    var token = localStorage.getItem('token') ? localStorage.getItem('token') : null;
    //console.log("Token: ", token);
    var fileName = window.location.href.split('/').pop().split('?')[0];

    if (fileName == 'index.html') { //Si está dentro de index está logueandose o creando otro usuario
        if (token != null) { //Si el token es diferente de null hacemos las comprobaciones
            deleteOldTokens(token) //Borramos los tokens fuera de vigencia y le pasamos el token que está en el navegador, ya que es diferente de null
            .then((response) => { 
                if (response.status == 'success') { //Si el servidor nos devuelve un success, es que el usuario ya está logueado, lo mandamos a main.html con la funcion swalNotificationAndLeave (Revisar documentacion de la funcion para saber como va)
                    jsError_alrLogued.reason = response.reason; //Le añadimos el reason al json de error para que el usuario tenga mas informacion de que ha sucedido
                    swalNotificationAndLeave(jsError_alrLogued);
                }
            }).catch((error) => {
                console.error(error);
            });
        } //Si el token es null no tenemos ningun problema y procedemos con el funcionamiento del archivo
    } else { //En caso de estar en otro archivo diferente de index.html hace la logica justo al reves
        if (token == null || token == '' || token == undefined) { //El usuario no está logueado y se le manda para index.html
            swalNotificationAndLeave(jsError_notLogued);
        } else { //Si existe un token, ejecutamos la funcion deleteOldTokens que borra tokens antiguos y luego con el token que hay en el localStorage busca si existe aún en la bbdd (significaría que no se ha borrado con lo que aun tiene fecha de vigencia)
            deleteOldTokens(token)
            .then((response) => {
                if (response.status == 'error') { //Si el Helper nos devuelve error es porque el token se ha borrado de la bbdd al no tener vigencia, se manda al usuario a index.hmtl
                    jsError_notLogued.reason = response.reason; //Al json de error se le añade el motivo para que la notificacion sea mas detallada y el usuario sepa que ha sucedido
                    swalNotificationAndLeave(jsError_notLogued);
                }
            }).catch((error) => {
                console.error(error);
            }); 
            getUserData(token); //Si el Helper nos devuelve success es porque el token seguiría vigente con lo que no se meteria en el if de arriba y podriamos seguir con el funcionamiento de la pagina
        }
    }
});

function log(form) {
    var username = form.username.value;
    var password = form.password.value;

    var xhr = new XMLHttpRequest();
    xhr.open('POST', middleware + 'log.php?function=login&username=' + username + '&password=' + password, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                var response = JSON.parse(xhr.responseText);
                localStorage.setItem('user_name', response.name);
                localStorage.setItem('token', response.token);
                swalNotificationAndLeave(response);
            }
        }
    }
    xhr.send();
    return false; 
}

function deleteOldTokens(token) { //Funcion que le manda informacion a log.php y ese archivo le pide recursos a authhelper.php    
    return new Promise((resolve, reject) => { //He hecho esta funcion promesa para tener menos lio con si se devuelven los recursos o no a tiempo, con esta funcion asi hecha, conseguimos que cuando se pida cierta informacion, hasta no recibirla no seguimos con el funcionamiento de la pagina
        var xhr = new XMLHttpRequest();
        xhr.open("POST", middleware + "log.php?function=deleteOldTokens&token=" + token, true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=utf-8");
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) {
                if (xhr.status === 200) 
                    resolve(JSON.parse(xhr.responseText));
                else
                    reject(JSON.parse(xhr.responseText));
                
            }
        };
        xhr.send();
    });
}

function swalNotificationAndLeave(response) { //Funcion para mostrar una notificacion de la libreria sweetalert, que me gusta bastante
    if ('reason' in response) //Si tiene la propiedad reason dentro de response, mostramos una notificacion con un pequeño texto para darle mas informacion al usuario de que acaba de pasar
        Swal.fire({
            position: "center",
            icon: response.status,
            title: response.message,
            text: response.reason,
            timer: response.timer,
            showConfirmButton: false
        });
    else 
        Swal.fire({
            position: "center",
            icon: response.status,
            title: response.message,
            timer: response.timer,
            showConfirmButton: false
        });
    
    setTimeout(function() {
        window.location.href = response.redirection;
    }, response.timer);
}

function getUserData(token) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', middleware + 'log.php?function=getUserData&token=' + token, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                var response = JSON.parse(xhr.responseText);
                window.name = response.name;
                window.role = response.role;
                document.dispatchEvent(new CustomEvent('userDataReady'));
            }   
        }
    };
    xhr.send();
}