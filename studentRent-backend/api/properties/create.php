<?php
// Strict headers for CORS and JSON
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

include_once '../../config/Database.php';
include_once '../middleware/Auth.php'; // Pull in the modular auth guard

// --- 1. JWT Authentication Middleware ---
// This one line handles headers, decoding, and expiration. 
// It automatically kills the script with a 401 if the token is bad.
$user_data = Auth::validateToken(); 

$database = new Database();
$db = $database->connect();

// --- 2. Process the Property Data ---
$data = json_decode(file_get_contents("php://input"));

// Validate required fields for the accommodation
if (!isset($data->title) || !isset($data->description) || !isset($data->price) || !isset($data->location)) {
    http_response_code(400);
    echo json_encode(['message' => 'Missing required property fields.']);
    exit();
}

// Generate UUID for the property
function generateUuid() {
    return sprintf('%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff),
        mt_rand(0, 0x0fff) | 0x4000, mt_rand(0, 0x3fff) | 0x8000,
        mt_rand(0, 0xffff), mt_rand(0, 0xffff), mt_rand(0, 0xffff)
    );
}

$property_id = generateUuid();
$created_at = date('Y-m-d H:i:s');

// The parameterized INSERT query linking the property to the verified user
// Note: Double-check if your primary key column is named 'id' or 'property_id' in phpMyAdmin!
$query = "INSERT INTO properties (property_id, landlord_id, title, description, price_per_month, location, created_at) 
          VALUES (:id, :user_id, :title, :description, :price, :location, :created_at)";

$stmt = $db->prepare($query);

// Clean inputs and bind parameters using bindValue for consistency
$stmt->bindValue(':id', $property_id);
$stmt->bindValue(':user_id', $user_data->user_id); // Securely grabbed from Auth.php
$stmt->bindValue(':title', htmlspecialchars(strip_tags($data->title)));
$stmt->bindValue(':description', htmlspecialchars(strip_tags($data->description)));
$stmt->bindValue(':price', htmlspecialchars(strip_tags($data->price)));
$stmt->bindValue(':location', htmlspecialchars(strip_tags($data->location)));
$stmt->bindValue(':created_at', $created_at);

if ($stmt->execute()) {
    http_response_code(201);
    echo json_encode(['message' => 'Property listed successfully.', 'property_id' => $property_id]);
} else {
    http_response_code(500);
    echo json_encode(['message' => 'Failed to list property.']);
}
?>