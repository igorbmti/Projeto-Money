<?php
/**
 * GarimPro - API de Autenticação & Sessão
 * Endpoint RESTful para Login, Validação de Credenciais, Logout e Auditoria
 */

require_once __DIR__ . '/db.php';

$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? 'login';

// Suporte a payload JSON ou form-data
$inputJSON = json_decode(file_get_contents('php://input'), true);
$postData = !empty($inputJSON) ? $inputJSON : $_POST;

$clientIp = $_SERVER['HTTP_X_FORWARDED_FOR'] ?? $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';

// ==============================================================================
// 1. AÇÃO: LOGIN (POST)
// ==============================================================================
if ($action === 'login' && $method === 'POST') {
    $username = trim($postData['username'] ?? $postData['email'] ?? '');
    $password = trim($postData['password'] ?? $postData['senha'] ?? '');
    $remember = !empty($postData['remember']);

    if (empty($username) || empty($password)) {
        sendResponse(false, null, 'Por favor, informe o usuário/e-mail e a senha.', 400);
    }

    // Se o banco de dados estiver disponível, tenta autenticar via MySQL
    if ($pdo) {
        try {
            $sql = "
                SELECT 
                    u.id_usuario,
                    u.id_perfil,
                    u.nome,
                    u.email,
                    u.senha,
                    u.telefone,
                    u.foto,
                    u.ativo,
                    p.nome AS perfil_nome
                FROM usuarios u
                LEFT JOIN perfis p ON u.id_perfil = p.id_perfil
                WHERE (u.email = :identifier OR u.nome = :identifier OR LOWER(u.email) = LOWER(:identifier))
                LIMIT 1
            ";

            $stmt = $pdo->prepare($sql);
            $stmt->execute(['identifier' => $username]);
            $dbUser = $stmt->fetch();

            if ($dbUser) {
                if ((int)$dbUser['ativo'] !== 1) {
                    sendResponse(false, null, 'Este usuário está inativo no sistema. Contate o administrador.', 403);
                }

                // Verifica a senha (bcrypt hash ou senhas padrão de teste)
                $isPasswordValid = password_verify($password, $dbUser['senha']) || 
                                   $password === 'admin' || 
                                   $password === 'admin123' ||
                                   $password === $dbUser['senha'];

                if ($isPasswordValid) {
                    // Atualiza último acesso
                    $updateStmt = $pdo->prepare("UPDATE usuarios SET ultimo_acesso = NOW() WHERE id_usuario = :id");
                    $updateStmt->execute(['id' => $dbUser['id_usuario']]);

                    // Registra log de auditoria
                    try {
                        $auditStmt = $pdo->prepare("
                            INSERT INTO auditoria (id_usuario, tabela, id_registro, acao, dados_novos, endereco_ip, data_hora)
                            VALUES (:id_usuario, 'usuarios', :id_registro, 'LOGIN', :dados, :ip, NOW())
                        ");
                        $auditStmt->execute([
                            'id_usuario' => $dbUser['id_usuario'],
                            'id_registro' => (string)$dbUser['id_usuario'],
                            'dados' => json_encode(['email' => $dbUser['email'], 'login_via' => 'Web App']),
                            'ip' => substr($clientIp, 0, 45)
                        ]);
                    } catch (Exception $e) {
                        // Não interrompe o login caso a auditoria falhe
                    }

                    // Gera iniciais para o avatar
                    $names = explode(' ', trim($dbUser['nome']));
                    $initials = strtoupper(substr($names[0], 0, 1) . (isset($names[1]) ? substr($names[1], 0, 1) : substr($names[0], 1, 1)));

                    $token = bin2hex(random_bytes(24));

                    $userPayload = [
                        'id' => (int)$dbUser['id_usuario'],
                        'name' => $dbUser['nome'],
                        'username' => $dbUser['email'],
                        'email' => $dbUser['email'],
                        'role' => $dbUser['perfil_nome'] ?? 'Administrador',
                        'avatar' => $initials,
                        'token' => $token,
                        'authenticated' => true,
                        'loginAt' => date('Y-m-d H:i:s')
                    ];

                    sendResponse(true, $userPayload, 'Autenticado com sucesso! Entrando no sistema...');
                }
            }
        } catch (PDOException $e) {
            // Em caso de erro na query, prossegue para checar credenciais padrão
        }
    }

    // Validação de credenciais de contingência / desenvolvimento
    $demoProfiles = [
        'admin' => [
            'name' => 'Igor Silva (Admin)',
            'email' => 'admin@garimpa.com.br',
            'role' => 'Administrador',
            'avatar' => 'IS'
        ],
        'admin@garimpa.com.br' => [
            'name' => 'Igor Silva (Admin)',
            'email' => 'admin@garimpa.com.br',
            'role' => 'Administrador',
            'avatar' => 'IS'
        ],
        'admin@sistema.local' => [
            'name' => 'Igor Silva (Admin)',
            'email' => 'admin@sistema.local',
            'role' => 'Administrador',
            'avatar' => 'IS'
        ],
        'igor' => [
            'name' => 'Igor Silva',
            'email' => 'igor@garimpa.com.br',
            'role' => 'Administrador',
            'avatar' => 'IS'
        ],
        'gerente' => [
            'name' => 'Juliana Gerente',
            'email' => 'juliana@garimpa.com.br',
            'role' => 'Gerente de Vendas',
            'avatar' => 'JG'
        ],
        'carlos' => [
            'name' => 'Carlos Vendedor',
            'email' => 'carlos@vendas.com',
            'role' => 'Vendedor Especialista',
            'avatar' => 'CV'
        ],
        'vendedor' => [
            'name' => 'Carlos Vendedor',
            'email' => 'carlos@vendas.com',
            'role' => 'Vendedor Especialista',
            'avatar' => 'CV'
        ]
    ];

    $uLower = strtolower($username);
    $isValidDemoUser = array_key_exists($uLower, $demoProfiles);
    $isValidDemoPass = in_array($password, ['admin', 'admin123', '123456', 'garimpro']);

    if ($isValidDemoUser && $isValidDemoPass) {
        $profile = $demoProfiles[$uLower];
        $token = bin2hex(random_bytes(24));

        $userPayload = [
            'id' => 1,
            'name' => $profile['name'],
            'username' => $username,
            'email' => $profile['email'],
            'role' => $profile['role'],
            'avatar' => $profile['avatar'],
            'token' => $token,
            'authenticated' => true,
            'loginAt' => date('Y-m-d H:i:s')
        ];

        sendResponse(true, $userPayload, 'Autenticado com sucesso! Entrando no sistema...');
    }

    sendResponse(false, null, 'Usuário ou senha incorretos. Utilize admin / admin para acesso.', 401);
}

// ==============================================================================
// 2. AÇÃO: LOGOUT (POST / GET)
// ==============================================================================
if ($action === 'logout') {
    $userId = (int)($postData['id_usuario'] ?? $_GET['id_usuario'] ?? 0);

    if ($pdo && $userId > 0) {
        try {
            $auditStmt = $pdo->prepare("
                INSERT INTO auditoria (id_usuario, tabela, id_registro, acao, dados_novos, endereco_ip, data_hora)
                VALUES (:id_usuario, 'usuarios', :id_registro, 'LOGOUT', :dados, :ip, NOW())
            ");
            $auditStmt->execute([
                'id_usuario' => $userId,
                'id_registro' => (string)$userId,
                'dados' => json_encode(['logout_via' => 'Web App']),
                'ip' => substr($clientIp, 0, 45)
            ]);
        } catch (Exception $e) {}
    }

    sendResponse(true, null, 'Sessão encerrada com sucesso.');
}

// ==============================================================================
// 3. AÇÃO: CHECK SESSION (GET)
// ==============================================================================
if ($action === 'check') {
    sendResponse(true, [
        'server_time' => date('Y-m-d H:i:s'),
        'db_online' => ($pdo !== null)
    ], 'Serviço de autenticação online.');
}

sendResponse(false, null, 'Ação inválida solicitada.', 400);
