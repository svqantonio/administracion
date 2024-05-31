<?php

    require_once '../helpers/Errors.php';
    require_once '../helpers/Ctes.php';
    require_once '../helpers/AuthHelper.php';
    
    $function = isset($_GET['function']) ? $_GET['function'] : null;
    $token = isset($_GET['token']) ? $_GET['token'] : null;

    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        if ($function === 'login') {
            $response = AuthHelper::login($_GET['username'], $_GET['password']);
        } else if ($function == 'deleteOldTokens') {
            $response = AuthHelper::deleteOldTokens($token);
        } else if ($function == 'logOut') {
            $response = AuthHelper::logOut($token);
        } else {
            $response = [
                "status" => "error",
                "message" => "Error al realizar la peticion!",
                "reason" => "No has introducido el function dentro de la url de la peticion!"
            ];
        }
    } else if ($_SERVER['REQUEST_METHOD'] == 'GET') {
        if ($function == 'loadAllTables') {
            $response = AuthHelper::loadAllTables($dbname);
        } else if ($function == 'getUserData') {
            $response = AuthHelper::getUserData($token);
        } else {
            $response = [
                "status" => "error",
                "message" => "Error al realizar la peticion!",
                "reason" => "No has introducido el function dentro de la url de la peticion!"
            ];
        }
    }

    echo json_encode($response);