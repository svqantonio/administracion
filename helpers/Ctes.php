<?php
    date_default_timezone_set('Europe/Madrid');

    //Datos del servidor local
    $servername = "localhost";
    $username = "root";
    $password = "";
    $dbname = "administracion";

    $options = array(
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4",
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION
    );

    $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password, $options);

    $timer = 1500;