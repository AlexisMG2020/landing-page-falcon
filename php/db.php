<?php
declare(strict_types=1);

function obtenerConexionMySQL(array $config): PDO
{
    $mysql = $config['mysql'] ?? [];

    $host = (string) ($mysql['host'] ?? '127.0.0.1');
    $port = (int) ($mysql['port'] ?? 3306);
    $dbname = (string) ($mysql['dbname'] ?? '');
    $user = (string) ($mysql['user'] ?? '');
    $password = (string) ($mysql['password'] ?? '');
    $charset = (string) ($mysql['charset'] ?? 'utf8mb4');

    if ($dbname === '' || $user === '') {
        throw new RuntimeException('La configuracion de MySQL esta incompleta.');
    }

    $dsn = sprintf(
        'mysql:host=%s;port=%d;dbname=%s;charset=%s',
        $host,
        $port,
        $dbname,
        $charset
    );

    return new PDO($dsn, $user, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
}
