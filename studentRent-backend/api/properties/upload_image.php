<?php
// Strict headers for CORS
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header("Access-Control-Max-Age: 3600");
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../../config/Database.php';
include_once '../middleware/Auth.php'; 

// 1. Authenticate the Request
$user_data = Auth::validateToken();

// 2. Validate inputs
// Note: We use $_POST and $_FILES instead of json_decode for file uploads
if (!isset($_POST['property_id']) || !isset($_FILES['image'])) {
    http_response_code(400);
    echo json_encode(['message' => 'Missing property_id or image file.']);
    exit();
}

$property_id = $_POST['property_id'];
$image = $_FILES['image'];

$database = new Database();
$db = $database->connect();

// 3. Ownership Check
$check_query = "SELECT landlord_id FROM properties WHERE property_id = :property_id LIMIT 1";
$check_stmt = $db->prepare($check_query);
$check_stmt->bindValue(':property_id', $property_id);
$check_stmt->execute();

if ($check_stmt->rowCount() === 0) {
    http_response_code(404);
    echo json_encode(['message' => 'Property not found.']);
    exit();
}

$property = $check_stmt->fetch(PDO::FETCH_ASSOC);

if ($property['landlord_id'] !== $user_data->user_id) {
    http_response_code(403);
    echo json_encode(['message' => 'Unauthorized.']);
    exit();
}

// 4. Image Validation
$allowed_types = ['image/jpeg', 'image/png', 'image/webp'];
$max_size = 5 * 1024 * 1024; // 5MB

if (!in_array($image['type'], $allowed_types)) {
    http_response_code(400);
    echo json_encode(['message' => 'Invalid file type. Only JPG, PNG, and WEBP are allowed.']);
    exit();
}

if ($image['size'] > $max_size) {
    http_response_code(400);
    echo json_encode(['message' => 'File is too large. Maximum size is 5MB.']);
    exit();
}

// 5. Save the File
// Generate a unique name so uploads don't overwrite each other
$file_extension = pathinfo($image['name'], PATHINFO_EXTENSION);
$new_file_name = uniqid('prop_', true) . '.' . $file_extension;
$upload_path = '../../uploads/' . $new_file_name;
$db_path = 'uploads/' . $new_file_name; // What we save in the DB

if (move_uploaded_file($image['tmp_name'], $upload_path)) {
    
    // 6. Update the Database
    $query = "UPDATE properties SET image_url = :image_url WHERE property_id = :property_id";
    $stmt = $db->prepare($query);
    $stmt->bindValue(':image_url', $db_path);
    $stmt->bindValue(':property_id', $property_id);
    
    if ($stmt->execute()) {
        http_response_code(200);
        echo json_encode([
            'message' => 'Image uploaded successfully.', 
            'image_url' => $db_path
        ]);
    } else {
        http_response_code(500);
        echo json_encode(['message' => 'Database update failed.']);
    }

} else {
    http_response_code(500);
    echo json_encode(['message' => 'Failed to save file to server.']);
}
?>