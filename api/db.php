<?php
/**
 * GarimPro - Database Connection (PDO MySQL) & CORS Gatekeeper
 * Suporte a Variáveis de Ambiente, Arquivo .env, Conexão Segura e Cabeçalhos CORS
 */

// 1. Configuração de Cabeçalhos e CORS
header('Content-Type: application/json; charset=utf-8');

// Função auxiliar para carregar arquivo .env se existir
function loadEnvFile($path) {
    if (!file_exists($path) || !is_readable($path)) {
        return false;
    }
    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if (empty($line) || strpos($line, '#') === 0) {
            continue;
        }
        if (strpos($line, '=') !== false) {
            list($name, $value) = explode('=', $line, 2);
            $name = trim($name);
            $value = trim($value, " \t\n\r\0\x0B\"'");
            if (!array_key_exists($name, $_SERVER) && !array_key_exists($name, $_ENV)) {
                putenv("{$name}={$value}");
                $_ENV[$name] = $value;
                $_SERVER[$name] = $value;
            }
        }
    }
    return true;
}

// Tenta carregar .env da raiz do projeto ou da pasta api/
loadEnvFile(__DIR__ . '/../.env');
loadEnvFile(__DIR__ . '/.env');

// Gerenciamento Dinâmico e Seguro de CORS
$allowedOriginConfig = getenv('CORS_ALLOWED_ORIGIN') ?: ($_ENV['CORS_ALLOWED_ORIGIN'] ?? ($_SERVER['CORS_ALLOWED_ORIGIN'] ?? '*'));
$requestOrigin = $_SERVER['HTTP_ORIGIN'] ?? '';

if ($allowedOriginConfig !== '*') {
    $allowedList = array_map('trim', explode(',', $allowedOriginConfig));
    if ($requestOrigin && in_array($requestOrigin, $allowedList, true)) {
        header("Access-Control-Allow-Origin: {$requestOrigin}");
    } elseif ($requestOrigin && preg_match('/\.vercel\.app$/', parse_url($requestOrigin, PHP_URL_HOST) ?? '')) {
        header("Access-Control-Allow-Origin: {$requestOrigin}");
    } else {
        header("Access-Control-Allow-Origin: " . ($allowedList[0] ?? '*'));
    }
} else {
    header('Access-Control-Allow-Origin: ' . ($requestOrigin ?: '*'));
}

header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

// Responde imediatamente a requisições Preflight OPTIONS
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

// 2. Parâmetros de Conexão com o Banco de Dados
$host = getenv('DB_HOST') ?: ($_ENV['DB_HOST'] ?? ($_SERVER['DB_HOST'] ?? 'localhost'));
$port = getenv('DB_PORT') ?: ($_ENV['DB_PORT'] ?? ($_SERVER['DB_PORT'] ?? '3306'));
$dbname = getenv('DB_NAME') ?: ($_ENV['DB_NAME'] ?? ($_SERVER['DB_NAME'] ?? 'controle_vendas'));
$username = getenv('DB_USER') ?: ($_ENV['DB_USER'] ?? ($_SERVER['DB_USER'] ?? 'root'));
$password = getenv('DB_PASS') !== false ? getenv('DB_PASS') : ($_ENV['DB_PASS'] ?? ($_SERVER['DB_PASS'] ?? ''));

$pdo = null;
$dbError = null;

try {
    $pdo = new PDO("mysql:host={$host};port={$port};dbname={$dbname};charset=utf8mb4", $username, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET NAMES utf8mb4 COLLATE utf8mb4_unicode_ci"
    ]);
} catch (PDOException $e) {
    // Retorna fallback gracioso caso o MySQL não esteja em execução
    $pdo = null;
    $dbError = $e->getMessage();
}

/**
 * Envia uma resposta JSON padronizada
 */
function sendResponse($success, $data = null, $message = '', $statusCode = 200) {
    http_response_code($statusCode);
    echo json_encode([
        'success' => $success,
        'message' => $message,
        'data' => $data,
        'timestamp' => date('Y-m-d H:i:s')
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}
