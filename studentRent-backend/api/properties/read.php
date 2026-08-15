<?php
// Strict headers for API structure, JSON formatting, and CORS
// Note: We allow GET methods here, not POST
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, OPTIONS'); 
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');
header("Access-Control-Max-Age: 3600");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
}

include_once '../../config/Database.php';

// Instantiate DB & connect
$database = new Database();
$db = $database->connect();

// Create the query
// We only want to show properties that are marked as visible, and we'll sort them by newest first
// FIXED: Added image_url to the SELECT statement
$query = "SELECT 
            property_id, 
            landlord_id, 
            title, 
            description, 
            price_per_month, 
            location, 
            distance_to_campus_km, 
            room_type, 
            amenities,
            image_url, 
            created_at 
          FROM properties 
          WHERE is_visible = 1 
          ORDER BY created_at DESC";

$stmt = $db->prepare($query);
$stmt->execute();

$row_count = $stmt->rowCount();

if ($row_count > 0) {
    // Create an array to hold the properties
    $properties_arr = [];
    $properties_arr['data'] = [];

    // Fetch the data
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        // Extract row so we can use $column_name instead of $row['column_name']
        extract($row);

        $property_item = [
            'property_id' => $property_id,
            'landlord_id' => $landlord_id,
            'title' => html_entity_decode($title),
            'description' => html_entity_decode($description),
            'price_per_month' => $price_per_month,
            'location' => $location,
            'distance_to_campus_km' => $distance_to_campus_km,
            'room_type' => $room_type,
            'amenities' => $amenities,
            'image_url' => $image_url, // FIXED: Now sending the image path back to React!
            'created_at' => $created_at
        ];

        // Push each property into the "data" array
        array_push($properties_arr['data'], $property_item);
    }

    // Set response code to 200 OK and output the JSON
    http_response_code(200);
    echo json_encode($properties_arr);

} else {
    // No properties found
    http_response_code(404);
    echo json_encode(['message' => 'No properties found.']);
}
?>