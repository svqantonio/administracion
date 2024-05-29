<?php

    require_once '../helpers/Errors.php';
    require_once '../helpers/Ctes.php';
    require_once '../helpers/AuthHelper.php';
    require_once '../helpers/cleanTokens.php';
    
    $function = isset($_GET['function']) ? $_GET['function'] : null;
    $token = isset($_GET['token']) ? $_GET['token'] : null;

    if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        if ($function !== null) {
            if ($function === 'login') {
                $response = AuthHelper::login($_GET['username'], $_GET['password']);
            } else if ($function == 'deleteOldTokens') {
                $token = new cleanTokens();
                $response = $token->deleteOldTokens();
            } else if ($function == 'logOut') {
                $response = AuthHelper::logOut($token);
            }
        } else {
            $response = [
                "status" => "error",
                "message" => "Oops. Ha habido un error!",
                "token" => null,
                "timer" => $timer
            ];
        }
    } else if ($_SERVER['REQUEST_METHOD'] == 'GET') {
        if ($function != null) {
            if ($function == 'loadAllTables') {
                $response = AuthHelper::loadAllTables($dbname);
            } else if ($function == 'getUserData') {
                $response = AuthHelper::getUserData($token);
            } else if ($function == 'checkTokenDate') {
                $instance = new cleanTokens();
                $response = $instance->checkTokenDate($token);
            }
        }
    }
    echo json_encode($response);