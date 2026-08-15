<?php
// Strict headers for API structure, JSON formatting, and CORS
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header("Access-control-Max-Age: 3600");
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../../config/Database.php';

// Instantiate DB & connect
$database = new Database();
$db = $database->connect();

// Capture raw POST data from the frontend
$data = json_decode(file_get_contents("php://input"));

// Validate incoming data payload
if (!isset($data->name) || !isset($data->email) || !isset($data->password) || !isset($data->role)) {
    http_response_code(400);
    echo json_encode(['message' => 'Missing required fields.']);
    exit(); 
}

// Function to generate a secure UUID v4 
function generateUuid() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000, mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

$user_id = generateUuid();
$email = htmlspecialchars(strip_tags($data->email));
$role = htmlspecialchars(strip_tags($data->role));

// Query to check if the email already exists
$check_query = "SELECT user_id FROM users WHERE email = :email LIMIT 1";
$check_stmt = $db->prepare($check_query);
$check_stmt->bindParam(':email', $email);
$check_stmt->execute();

if ($check_stmt->rowCount() > 0) {
    http_response_code(409); // Conflict
    echo json_encode(['message' => 'Email is already registered.']);
    exit();
}

// Cryptographically hash the password
$hashed_password = password_hash($data->password, PASSWORD_DEFAULT);

// Generate the creation timestamp explicitly in a 24-hour format
$created_at = date('Y-m-d H:i:s');

try {
    // Start a transaction: Do not save permanently until ALL queries succeed
    $db->beginTransaction();

    // --- 1. INSERT INTO USERS TABLE ---
    $query = "INSERT INTO users (user_id, name, email, password_hash, role, created_at) 
              VALUES (:user_id, :name, :email, :password_hash, :role, :created_at)";

    $stmt = $db->prepare($query);
    $stmt->bindValue(':user_id', $user_id);
    $stmt->bindValue(':name', htmlspecialchars(strip_tags($data->name)));
    $stmt->bindValue(':email', $email);
    $stmt->bindValue(':password_hash', $hashed_password);
    $stmt->bindValue(':role', $role);
    $stmt->bindValue(':created_at', $created_at);
    
    // Execute first query
    $stmt->execute();

    // --- 2. CONDITIONALLY INSERT INTO LANDLORD_PROFILES ---
    if ($role === 'landlord') {
        $landlord_query = "INSERT INTO landlord_profiles (landlord_id) VALUES (:landlord_id)";
        $landlord_stmt = $db->prepare($landlord_query);
        $landlord_stmt->bindValue(':landlord_id', $user_id);
        
        // Execute second query
        $landlord_stmt->execute();
    }

    // Both queries succeeded, commit the changes to the database
    $db->commit();

    http_response_code(201); // Created
    echo json_encode(['message' => 'User registered successfully.']);

} catch (Exception $e) {
    // An error occurred, roll back any changes made during the transaction
    $db->rollBack();
    
    http_response_code(500); // Internal Server Error
    echo json_encode(['message' => 'User registration failed.']);
}
?>