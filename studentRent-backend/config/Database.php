<?php
class Database {
    // Database credentials
    private $host = 'sql308.infinityfree.com';
    private $db_name = 'if0_42662608_studentRent';
    private $username = 'if0_42662608';
    private $password = 'LS180405'; // The one you just set in Workbench
    private $conn;

    // Secure DB Connection
    public function connect() {
        $this->conn = null;

        try {
            // Using PDO for maximum security and prepared statements
            $this->conn = new PDO(
                'mysql:host=' . $this->host . ';dbname=' . $this->db_name . ';charset=utf8mb4', 
                $this->username, 
                $this->password
            );
            
            // Enforce strict error handling to catch issues immediately
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            
            // Prevent emulated prepared statements (forces true MySQL prepared statements)
            $this->conn->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);
            
        } catch(PDOException $e) {
            http_response_code(500); // Internal Server Error
            echo json_encode(array('message' => 'Database Connection Error.', 'error_details' => $e->getMessage()));
            exit();

        }

        return $this->conn;
    }
}
?>