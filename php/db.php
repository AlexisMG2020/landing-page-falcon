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
    $options = trim((string) ($postgres['options'] ?? ''));

    if ($dbname === '' || $user === '') {
        throw new RuntimeException('La configuracion de PostgreSQL esta incompleta.');
    }

    // Neon puede requerir el endpoint explicito cuando la libreria libpq no soporta SNI.
    if ($options === '' && preg_match('/^(ep-[^.]+)\./i', $host, $matches) === 1) {
        $options = 'endpoint=' . $matches[1];
    }

    $dsnParts = [
        sprintf('host=%s', $host),
        sprintf('port=%d', $port),
        sprintf('dbname=%s', $dbname),
        sprintf('sslmode=%s', $sslmode),
    ];

    if ($options !== '') {
        $dsnParts[] = sprintf('options=%s', $options);
    }

    $dsn = 'pgsql:' . implode(';', $dsnParts);

    return new PDO($dsn, $user, $password, [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    ]);
}
