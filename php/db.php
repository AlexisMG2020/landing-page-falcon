<?php
declare(strict_types=1);

function obtenerConexionPostgres(array $config): PDO
{
    $postgres = $config['postgres'] ?? [];

    $host = (string) ($postgres['host'] ?? '127.0.0.1');
    $port = (int) ($postgres['port'] ?? 5432);
    $dbname = (string) ($postgres['dbname'] ?? '');
    $user = (string) ($postgres['user'] ?? '');
    $password = (string) ($postgres['password'] ?? '');
    $sslmode = (string) ($postgres['sslmode'] ?? 'prefer');

    if ($dbname === '' || $user === '') {
        throw new RuntimeException('La configuracion de PostgreSQL esta incompleta.');
    }

    $dsn = sprintf(
        'pgsql:host=%s;port=%d;dbname=%s;sslmode=%s',
        $host,
        $port,
        $dbname,
        $sslmode
    );

    return new PDO($dsn, $user, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
}
