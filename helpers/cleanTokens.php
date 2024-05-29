<?php

    class cleanTokens {
        public function deleteOldTokens() {
            global $conn;
    
            try {
                
                //$stmt = $conn->prepare("DELETE FROM tokens WHERE token_expiration < DATE_ADD(NOW(), INTERVAL 2 HOUR);"); //Este sirve para mi servidor privado
                $stmt = $conn->prepare("DELETE FROM tokens WHERE token_expiration < NOW();");
                $stmt->execute();
                

                if ($stmt->rowCount() > 0)
                    return [
                        "status" => "success",
                        "message" => "Tokens eliminados correctamente",
                        "deletedTokens" => $stmt->rowCount()
                    ];
                else
                    return [
                        "status" => "error",
                        "message" => "No se eliminaron tokens"
                    ];
            } catch (PDOException $e) {
                echo "Error al eliminar tokens: " . $e->getMessage();
            } catch (Exception $e) {
                echo "Error: " . $e->getMessage();
            }
        }

        public static function checkTokenDate($token) {
            global $conn; 

            $stmt = $conn->prepare("SELECT token_expiration FROM tokens WHERE token = :token");
            $stmt->bindParam(':token', $token); 
            $stmt->execute();

            if ($stmt->rowCount() > 0) {
                $result = $stmt->fetch(PDO::FETCH_ASSOC);
                return [
                    "status" => "success",
                    "message" => "Existe fecha de vigencia para el token",
                    "token_expiration" => $result['token_expiration']
                ];
            } else 
                return [
                    "status" => "error",
                    "message" => "No estás logueado, te retornamos al login",
                    "token_expiration" => null,
                ];
        }
    }