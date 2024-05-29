<?php

    require_once '../helpers/Errors.php';
    require_once '../helpers/Ctes.php';
    require_once '../helpers/TableHelper.php';

    $function = isset($_GET['function']) ? $_GET['function'] : null;
    $table = isset($_GET['table']) ? $_GET['table'] : null;
    $id = isset($_GET['id']) ? $_GET['id'] : null;
    $token = isset($_GET['token']) ? $_GET['token'] : null;

    if ($_SERVER['REQUEST_METHOD'] == 'GET') {
        if ($function != null) {
            if ($function == 'loadTableContent') {
                $response = TableHelper::loadTableContent($table);
            } else if ($function == 'loadNumberFields') {
                $response = TableHelper::loadNumberFields($table);
            } else if ($function == 'getTableStructure') {
                $response = TableHelper::getTableStructure($table);
            } else if ($function == 'getFkData') {
                $response = TableHelper::getFkData($table);
            }
        }
    } else if ($_SERVER['REQUEST_METHOD'] == 'POST') {
        if ($function != null) {
            if ($function == 'deleteValue') {
                $response = TableHelper::deleteValue($table, $id, $token);
            } else if ($function == 'editValues') {
                $json = file_get_contents('php://input');
                $data = json_decode($json, true);
                $response = TableHelper::editValues($table, $data);
            }
        }
    }

    echo json_encode($response);