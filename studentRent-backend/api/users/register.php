<?php
// Strict headers for API structure, JSON formatting, and CORS
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

include_once '../../config/Database.php';

// Instantiate DB & connect
$database = new Database();
$db = $database->connect();

// Capture raw POST data from the frontend
$data = json_decode(file_get_contents("php://input"));

// Validate incoming data payload (Matching your Thunder Client JSON)
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

// Query to check if the email already exists (Updated to user_id)
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

// The parameterized INSERT query (Aligned with your schema and payload)
$query = "INSERT INTO users (user_id, name, email, password_hash, role, created_at) 
          VALUES (:user_id, :name, :email, :password_hash, :role, :created_at)";

$stmt = $db->prepare($query);

// Clean user input and bind the values directly
$stmt->bindValue(':user_id', $user_id);
$stmt->bindValue(':name', htmlspecialchars(strip_tags($data->name)));
$stmt->bindValue(':email', $email);
$stmt->bindValue(':password_hash', $hashed_password);
$stmt->bindValue(':role', htmlspecialchars(strip_tags($data->role)));
$stmt->bindValue(':created_at', $created_at);

// Execute the final query
if ($stmt->execute()) {
    http_response_code(201); // Created
    echo json_encode(['message' => 'User registered successfully.']);
} else {
    http_response_code(500); // Internal Server Error
    echo json_encode(['message' => 'User registration failed.']);
}
?>