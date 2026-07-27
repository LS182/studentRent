<?php
// Strict headers for CORS and JSON
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

include_once '../../config/Database.php';

$database = new Database();
$db = $database->connect();

$data = json_decode(file_get_contents("php://input"));

// Validate payload
if (!isset($data->email) || !isset($data->password)) {
    http_response_code(400);
    echo json_encode(['message' => 'Email and password are required.']);
    exit();
}

$email = htmlspecialchars(strip_tags($data->email));

// 1. Corrected query to match your database schema
$query = "SELECT user_id, name, password_hash, role FROM users WHERE email = :email LIMIT 1";
$stmt = $db->prepare($query);
$stmt->bindValue(':email', $email); // Using bindValue for consistency!
$stmt->execute();

if ($stmt->rowCount() === 0) {
    http_response_code(401); // Unauthorized
    echo json_encode(['message' => 'Invalid credentials.']);
    exit();
}

$user = $stmt->fetch(PDO::FETCH_ASSOC);

// 2. Verify the provided password against the correct column: password_hash
if (password_verify($data->password, $user['password_hash'])) {
    
    // --- JWT Generation Logic ---
    $secret_key = 'Liam'; 
    $issued_at = time();
    $expiration_time = $issued_at + (60 * 60 * 24); // Token valid for 24 hours
    
    // Create token header
    $header = json_encode(['typ' => 'JWT', 'alg' => 'HS256']);
    
    // 3. Update token payload to match your actual data
    $payload = json_encode([
        'iat' => $issued_at,
        'exp' => $expiration_time,
        'data' => [
            'user_id' => $user['user_id'],
            'name' => $user['name'],
            'email' => $email,
            'role' => $user['role']
        ]
    ]);
    
    // Encode Header and Payload to Base64Url
    $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($header));
    $base64UrlPayload = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($payload));
    
    // Create Signature using HMAC SHA256
    $signature = hash_hmac('sha256', $base64UrlHeader . "." . $base64UrlPayload, $secret_key, true);
    $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));
    
    // Combine everything into the final JWT string
    $jwt = $base64UrlHeader . "." . $base64UrlPayload . "." . $base64UrlSignature;
    
    http_response_code(200); // OK
    echo json_encode([
        'message' => 'Login successful.',
        'token' => $jwt,
        'user' => [
            'user_id' => $user['user_id'],
            'name' => $user['name'],
            'role' => $user['role']
        ]
    ]);
} else {
    http_response_code(401); // Unauthorized
    echo json_encode(['message' => 'Invalid credentials.']);
}
?>