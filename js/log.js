var timer = 1500;

var jsError_notLogued = {
    "status" : "error",
    "message" : "No estás logueado!",
    "timer" : timer,
    "redirection" : "index.html"
};

var jsError_alrLogued = {
    "message" : "Ya estás logueado!",
    "timer" : timer,
    "redirection" : "main.html"
};

function getFolderName() {
    var absoluteUrl = window.location.href;
    var url = new URL(absoluteUrl);
    var directoryPath = url.pathname.substring(0, url.pathname.lastIndexOf('/'));
    return directoryPath;
}

var middleware = getFolderName() + "/middleware/";

document.addEventListener('DOMContentLoaded', function() {
    var token = localStorage.getItem('token') ? localStorage.getItem('token') : null;
    //console.log("Token: ", token);
    var fileName = window.location.href.split('/').pop().split('?')[0];

    deleteOldTokens(); //Lo primero, borrar tokens

    if (fileName == 'index.html') { //Si está dentro de index está logueandose o creando otro usuario
        if (token != null || token != '') { //Si existe ya el token significa que el usuario está logueado
            //Si existe token, comprobar que la fecha de caducidad no haya pasado
            tokenDate(token)
            .then((response) => {
                if (checkTokenDate(response).status == 'success') { //Si el token esta vigente el usuario está ya logueado
                    let rspn_cmbd_st = Object.assign({}, response, jsError_alrLogued);
                    let rspn_cmbd_js = JSON.stringify(rspn_cmbd_st); 
                    swalNotificationAndLeave(rspn_cmbd_js);
                } //No tiene sentido ponerle un else porque no va a llegar nunca el caso de que le llegue un token no vigente debido a que borramos antiguos tokens al principio del codigo
            }).catch((error) => {
                console.error(error);
            });   
        }
    } else { //En caso de estar en otro archivo diferente de index.html hace la logica justo al reves
        if (token == null || token == '' || token == undefined) { //El usuario no está logueado
            swalNotificationAndLeave(jsError_notLogued);
        } else {
            tokenDate(token)
            .then(response => {
                if (checkTokenDate(response).status == 'error') {
                    let rspn_cmbd_st = Object.assign({}, response, {'redirection' : 'index.html'});
                    let rspn_cmbd_js = JSON.stringify(rspn_cmbd_st);
                    swalNotificationAndLeave(rspn_cmbd_js);
                }
            }).catch(error => {
                console.error(error);
            });
            getUserData(token);
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

function deleteOldTokens() {    
    var xhr = new XMLHttpRequest();
    xhr.open("POST", middleware + "log.php?function=deleteOldTokens", true);
    xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=utf-8");
    xhr.onreadystatechange = function() {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            var response = JSON.parse(xhr.responseText);    
            //console.log("Respuesta del servidor a borrar antiguos tokens: ", response);
        }
    };
    xhr.send();
}

function tokenDate(token) {
    return new Promise((resolve, reject) => {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', middleware + 'log.php?function=checkTokenDate&token=' + token, true);
        xhr.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=utf-8");
        xhr.onreadystatechange = function() {
            if (xhr.readyState === XMLHttpRequest.DONE) 
                if (xhr.status === 200) {
                    var response = JSON.parse(xhr.responseText);
                    resolve(response);
                } else {
                    const error = new Error("Error!");
                    error.status = xhr.status;
                    error.statusText = xhr.statusText;
                    reject(error);
                }    
        };
        xhr.send();
    });
}

function swalNotificationAndLeave(response) {
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

function checkTokenDate(response) { //En esta funcion le pasamos un token existente en la bbdd, comprobamos que la fecha no haya expirado y devolvemos datos en función de la respuesta del servidor
    if (response.token_expiration != null) {
        var currentDate = new Date();
        //console.log("Fecha actual: ", currentDate);
        var expirationDate = new Date(response.token_expiration);
        //console.log("Fecha de expiracion: ", expirationDate);
        if (currentDate > expirationDate)
            return {
                "status" : "error",
                "message" : "El token ha expirado",
                "timer" : 1500
            };
        else 
            return {
                "status" : "success",
                "message" : "El token sigue vigente",
                "timer" : null
            };
    } else 
        return {
            "status" : "error",
            "message" : "No se ha encontrado la fecha de expiración del token",
            "timer" : 1500
        };
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