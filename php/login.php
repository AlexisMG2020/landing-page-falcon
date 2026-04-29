<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'message' => 'Metodo no permitido']);
    exit;
}

$config = require __DIR__ . '/config.php';
require_once __DIR__ . '/db.php';

function loginJsonError(string $message, int $status = 400): never
{
    http_response_code($status);
    echo json_encode(['ok' => false, 'message' => $message], JSON_UNESCAPED_UNICODE);
    exit;
}

function quoteIdentifier(string $identifier): string
{
    $parts = explode('.', $identifier);

    foreach ($parts as $part) {
        if (!preg_match('/^[A-Za-z_][A-Za-z0-9_]*$/', $part)) {
            throw new RuntimeException('Nombre de tabla o columna invalido en la configuracion del login.');
        }
    }

    return implode('.', array_map(
        static fn(string $part): string => '"' . $part . '"',
        $parts
    ));
}

function passwordMatches(string $inputPassword, string $storedPassword): bool
{
    if ($storedPassword === '') {
        return false;
    }

    if (password_verify($inputPassword, $storedPassword)) {
        return true;
    }

    return hash_equals($storedPassword, $inputPassword);
}

$email = trim((string) ($_POST['email'] ?? ''));
$password = (string) ($_POST['password'] ?? '');

if ($email === '' || $password === '') {
    loginJsonError('Ingresa tu correo y tu contrasena.');
}

$loginConfig = $config['login'] ?? [];

try {
    $table = quoteIdentifier((string) ($loginConfig['table'] ?? 'users'));
    $emailColumn = quoteIdentifier((string) ($loginConfig['email_column'] ?? 'email'));
    $passwordColumn = quoteIdentifier((string) ($loginConfig['password_column'] ?? 'password_hash'));
    $linkColumn = quoteIdentifier((string) ($loginConfig['access_link_column'] ?? 'access_link'));
    $companyNameColumn = quoteIdentifier((string) ($loginConfig['company_name_column'] ?? 'company_name'));
    $companyLogoColumn = quoteIdentifier((string) ($loginConfig['company_logo_column'] ?? 'company_logo_url'));
    $activeColumn = trim((string) ($loginConfig['active_column'] ?? ''));

    $sql = "SELECT {$emailColumn} AS email, {$passwordColumn} AS password_value, {$linkColumn} AS access_link,
                   {$companyNameColumn} AS company_name, {$companyLogoColumn} AS company_logo_url
            FROM {$table}
            WHERE LOWER({$emailColumn}) = LOWER(:email)";

    if ($activeColumn !== '') {
        $sql .= ' AND ' . quoteIdentifier($activeColumn) . ' = TRUE';
    }

    $sql .= ' LIMIT 1';

    $pdo = obtenerConexionPostgres($config);
    $statement = $pdo->prepare($sql);
    $statement->execute(['email' => $email]);
    $user = $statement->fetch();

    if (!$user || !passwordMatches($password, (string) ($user['password_value'] ?? ''))) {
        loginJsonError('Credenciales invalidas.', 401);
    }

    $accessLink = trim((string) ($user['access_link'] ?? ''));
    if ($accessLink === '') {
        $accessLink = 'https://consultoria.falconventures.net/';
    }

    $companyName = trim((string) ($user['company_name'] ?? ''));
    if ($companyName === '') {
        $companyName = 'Falcon Ventures';
    }

    $companyLogoUrl = trim((string) ($user['company_logo_url'] ?? ''));
    if ($companyLogoUrl === '') {
        $companyLogoUrl = 'https://static.wixstatic.com/media/423b16_75aaf836c99a47dbbac5fedc906ace3e~mv2.png/v1/crop/x_0,y_170,w_3000,h_733/fill/w_532,h_130,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Color%20logo%20-%20no%20background_edited.png';
    }

    echo json_encode([
        'ok' => true,
        'message' => 'Acceso autorizado.',
        'link' => $accessLink,
        'email' => (string) ($user['email'] ?? $email),
        'company_name' => $companyName,
        'company_logo_url' => $companyLogoUrl,
    ], JSON_UNESCAPED_UNICODE);
} catch (PDOException $exception) {
    $sqlState = (string) ($exception->errorInfo[0] ?? '');

    if ($sqlState === '42P01') {
        loginJsonError('La tabla configurada para el login no existe en esta base de datos.', 500);
    }

    if ($sqlState === '42S22' || $sqlState === '42703') {
        loginJsonError('Faltan columnas requeridas para el login en la base de datos.', 500);
    }

    loginJsonError('No fue posible consultar la base de datos.', 500);
} catch (Throwable $exception) {
    loginJsonError($exception->getMessage(), 500);
}
