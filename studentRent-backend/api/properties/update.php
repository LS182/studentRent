<?php
// Strict headers 
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: PUT'); // PUT is the standard method for updating
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

include_once '../../config/Database.php';
include_once '../middleware/Auth.php'; 

// 1. Authenticate the Request
$user_data = Auth::validateToken();

$database = new Database();
$db = $database->connect();

$data = json_decode(file_get_contents("php://input"));

// 2. Validate required fields (including the property_id so we know what to update)
if (!isset($data->property_id) || !isset($data->title) || !isset($data->description) || !isset($data->price_per_month) || !isset($data->location)) {
    http_response_code(400);
    echo json_encode(['message' => 'Missing required fields.']);
    exit();
}

// 3. Ownership Check: Ensure the logged-in user owns this specific property
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
    http_response_code(403); // 403 Forbidden
    echo json_encode(['message' => 'Unauthorized. You do not have permission to edit this property.']);
    exit();
}

// 4. Update the Property
$query = "UPDATE properties 
          SET title = :title, description = :description, price_per_month = :price, location = :location 
          WHERE property_id = :property_id";

$stmt = $db->prepare($query);

// Bind the new values
$stmt->bindValue(':title', htmlspecialchars(strip_tags($data->title)));
$stmt->bindValue(':description', htmlspecialchars(strip_tags($data->description)));
$stmt->bindValue(':price', htmlspecialchars(strip_tags($data->price_per_month)));
$stmt->bindValue(':location', htmlspecialchars(strip_tags($data->location)));
$stmt->bindValue(':property_id', $data->property_id);

if ($stmt->execute()) {
    http_response_code(200);
    echo json_encode(['message' => 'Property updated successfully.']);
} else {
    http_response_code(500);
    echo json_encode(['message' => 'Failed to update property.']);
}
?>