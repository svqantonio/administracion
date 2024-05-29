<?php

    class TableHelper {

        public static function loadTableContent($table) {
            global $conn;

            if ($table == 'users') 
                $stmt = $conn->prepare('SELECT u.id, u.username, u.name, u.password, r.type AS role, u.role AS role_id FROM users u, roles r WHERE u.role = r.id;');
            else 
                $stmt = $conn->prepare('SELECT * FROM ' . $table);
            
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $result;
        }

        public static function loadNumberFields($table) {
            global $conn;

            $stmt = $conn->prepare('SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS WHERE TABLE_NAME = :table AND TABLE_SCHEMA = DATABASE()');
            $stmt->bindParam(':table', $table, PDO::PARAM_STR);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $result;
        }

        public static function deleteValue($table, $id, $token) {
            global $conn; global $timer;
            $redirection = 'table.html?table=' . $table;

            //ESTA FUNCION PUEDE DAR UN PROBLEMA Y ES QUE COMO ALGUNAS TABLAS TIENE FOREIGN KEYS ASOCIADAS SI INTENTAS BORRAR UN REGISTRO DE UNA TABLA QUE TIENE CLAVES AJENAS ACTIVAS NO TE VA A DEJAR PORQUE TE VA A SALTAR LA REVISION DE CLAVES AJENAS

            $stmt = $conn->prepare('SELECT user_id FROM tokens WHERE token = :token'); //Primero hacemos una query que nos devuelve el id del usuario al que le pertenece el token activo
            $stmt->bindParam(':token', $token);
            $stmt->execute();
            $result = $stmt->fetch(PDO::FETCH_ASSOC);
            if ($result['user_id'] == $id) { //Comprobamos si el id que nos devuelve la query es igual al id que estamos intentando borrar, ya que si coinciden va a reventar el codigo por todos lados
                return [
                    "status" => "error",
                    "message" => "Estás intentando borrar al usario activo",
                    "redirection" => $redirection,
                    "timer" => $timer
                ];
            } else { //En caso contrario podemos borrar el usuario, ya que no vamos a estar intentando borrar al usuario activo
                $stmt = $conn->prepare('DELETE FROM ' . $table . ' WHERE id = :id'); 
                $stmt->bindParam(':id', $id);
                if ($stmt->execute()) {
                    return [
                        "status" => "success",
                        "message" => "Usuario borrado correctamente",
                        "redirection" => $redirection,
                        "timer" => $timer
                    ];
                } else {
                    return [
                        "status" => "error",
                        "message" => "Ha habido un error borrando el registro",
                        "redirection" => $redirection,
                        "timer" => $timer
                    ];
                }
            }
        }

        public static function getTableStructure($table) {
            global $conn; global $dbname;

            $stmt = $conn->prepare("SELECT 
                COLUMNS.COLUMN_NAME, 
                COLUMNS.COLUMN_TYPE, 
                COLUMNS.IS_NULLABLE, 
                COLUMNS.COLUMN_KEY, 
                COLUMNS.COLUMN_DEFAULT, 
                COLUMNS.EXTRA, 
                IFNULL(KEY_COLUMN_USAGE.CONSTRAINT_NAME, '') AS CONSTRAINT_NAME, 
                IFNULL(KEY_COLUMN_USAGE.REFERENCED_TABLE_NAME, '') AS REFERENCED_TABLE_NAME, 
                IFNULL(KEY_COLUMN_USAGE.REFERENCED_COLUMN_NAME, '') AS REFERENCED_COLUMN_NAME
            FROM 
                INFORMATION_SCHEMA.COLUMNS AS COLUMNS
            LEFT JOIN 
                INFORMATION_SCHEMA.KEY_COLUMN_USAGE AS KEY_COLUMN_USAGE
                ON 
                    COLUMNS.TABLE_SCHEMA = KEY_COLUMN_USAGE.TABLE_SCHEMA AND 
                    COLUMNS.TABLE_NAME = KEY_COLUMN_USAGE.TABLE_NAME AND 
                    COLUMNS.COLUMN_NAME = KEY_COLUMN_USAGE.COLUMN_NAME AND 
                    KEY_COLUMN_USAGE.REFERENCED_TABLE_NAME IS NOT NULL
            WHERE 
                COLUMNS.TABLE_NAME = :table AND 
                COLUMNS.TABLE_SCHEMA = :dbname;
            ");
            $stmt->bindParam(':table', $table);
            $stmt->bindParam(':dbname', $dbname);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $result;
        }

        public static function editValues($table, $data) {
            global $conn;
            global $timer;
            $redirection = 'table.html?table=' . $table;
        
            $setClause = ""; // Inicializar la parte SET de la consulta
            $values = []; // Inicializar un array para almacenar los valores de los parámetros
        
            // Iterar sobre el JSON recibido para construir la parte SET de la consulta
            foreach ($data as $columnName => $columnValue) {
                // Agregar el nombre de la columna y su nuevo valor a la parte SET
                $setClause .= "$columnName = ?, ";
                // Agregar el valor al array de valores de los parámetros
                $values[] = $columnValue;
            }
        
            // Eliminar la coma extra al final de la parte SET
            $setClause = rtrim($setClause, ", ");
        
            // Construir la consulta de actualización
            $sql = "UPDATE $table SET $setClause WHERE id = ?";
        
            // Añadir el valor del parámetro id al final del array de valores
            $values[] = $data['id'];
        
            // Preparar y ejecutar la consulta
            $stmt = $conn->prepare($sql);
            $result = $stmt->execute($values);
        
            if ($result) {
                return [
                    "status" => "success",
                    "message" => "Registro actualizado correctamente",
                    "redirection" => $redirection,
                    "timer" => $timer
                ];
            } else {
                return [
                    "status" => "error",
                    "message" => "Ha habido un error actualizando el registro",
                    "redirection" => $redirection,
                    "timer" => $timer
                ];
            }
        }        

        public static function getFkData($table) {
            global $conn;

            $tbl = $table . "s";
            $query = 'SELECT * FROM ' . $tbl;

            $stmt = $conn->prepare($query);
            $stmt->execute();
            $result = $stmt->fetchAll(PDO::FETCH_ASSOC);
            return $result;
        }

    }