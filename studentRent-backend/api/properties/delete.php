<?php
// Strict headers
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: DELETE, OPTIONS'); // DELETE method
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');
header("Access-Control-Max-Age: 3600");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../../config/Database.php';
include_once '../middleware/Auth.php'; 

// 1. Authenticate the Request
$user_data = Auth::validateToken();

$database = new Database();
$db = $database->connect();

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->property_id)) {
    http_response_code(400);
    echo json_encode(['message' => 'Missing property_id.']);
    exit();
}

// 2. Ownership Check
$check_query = "SELECT landlord_id FROM properties WHERE property_id = :property_id LIMIT 1";
$check_stmt = $db->prepare($check_query);
$check_stmt->bindValue(':property_id', $data->property_id);
$check_stmt->execute();

if ($check_stmt->rowCount() === 0) {
    http_response_code(404);
    echo json_encode(['message' => 'Property not found.']);
    exit();
}

$property = $check_stmt->fetch(PDO::FETCH_ASSOC);

if ($property['landlord_id'] !== $user_data->user_id) {
    http_response_code(403);
    echo json_encode(['message' => 'Unauthorized. You do not have permission to delete this property.']);
    exit();
}

// 3. Delete the Property
$query = "DELETE FROM properties WHERE property_id = :property_id";
$stmt = $db->prepare($query);
$stmt->bindValue(':property_id', $data->property_id);

if ($stmt->execute()) {
    http_response_code(200);
    echo json_encode(['message' => 'Property deleted successfully.']);
} else {
    http_response_code(500);
    echo json_encode(['message' => 'Failed to delete property.']);
}
?>