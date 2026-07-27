<?php
class Auth {
    // This must match the secret key in your login.php exactly!
    private static $secret_key = 'Liam'; 

    public static function validateToken() {
        // 1. Get the Authorization header
        $headers = null;
        if (isset($_SERVER['Authorization'])) {
            $headers = trim($_SERVER["Authorization"]);
        } else if (isset($_SERVER['HTTP_AUTHORIZATION'])) { // Nginx or fast CGI
            $headers = trim($_SERVER["HTTP_AUTHORIZATION"]);
        } elseif (function_exists('apache_request_headers')) {
            $requestHeaders = apache_request_headers();
            $requestHeaders = array_combine(array_map('ucwords', array_keys($requestHeaders)), array_values($requestHeaders));
            if (isset($requestHeaders['Authorization'])) {
                $headers = trim($requestHeaders['Authorization']);
            }
        }

        // 2. Extract the token from the "Bearer <token>" string
        if (!empty($headers)) {
            if (preg_match('/Bearer\s(\S+)/', $headers, $matches)) {
                $token = $matches[1];
            }
        }

        if (!isset($token)) {
            http_response_code(401);
            echo json_encode(['message' => 'Access denied. No token provided.']);
            exit();
        }

        // 3. Split the token into its three parts
        $tokenParts = explode('.', $token);
        if (count($tokenParts) !== 3) {
            http_response_code(401);
            echo json_encode(['message' => 'Access denied. Invalid token format.']);
            exit();
        }

        $header = $tokenParts[0];
        $payload = $tokenParts[1];
        $signature_provided = $tokenParts[2];

        // 4. Re-create the signature using the header, payload, and your secret key
        $signature = hash_hmac('sha256', $header . "." . $payload, self::$secret_key, true);
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        // 5. Verify the signature matches
        // hash_equals prevents timing attacks
        if (!hash_equals($base64UrlSignature, $signature_provided)) {
            http_response_code(401);
            echo json_encode(['message' => 'Access denied. Signature verification failed.']);
            exit();
        }

        // 6. Decode the payload to check expiration and return user data
        // Fix base64 padding before decoding
        $payload_decoded = json_decode(base64_decode(str_replace(['-', '_'], ['+', '/'], $payload)));

        if ($payload_decoded->exp < time()) {
            http_response_code(401);
            echo json_encode(['message' => 'Access denied. Token has expired. Please log in again.']);
            exit();
        }

        // Validation passed! Return the user data so the protected route knows who is making the request
        return $payload_decoded->data;
    }
}
?>