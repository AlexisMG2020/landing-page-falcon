<?php
declare(strict_types=1);

/**
 * Establece una conexión con PostgreSQL optimizada para Neon.
 * 
 * @param array $config Configuración cargada desde config.php
 * @return PDO
 * @throws RuntimeException Si la configuración es incompleta.
 */
function obtenerConexionPostgres(array $config): PDO
{
    $postgres = $config['postgres'] ?? [];

    $host = (string) ($postgres['host'] ?? '');
    $port = (int) ($postgres['port'] ?? 5432);
    $dbname = (string) ($postgres['dbname'] ?? '');
    $user = (string) ($postgres['user'] ?? '');
    $password = (string) ($postgres['password'] ?? '');
    $sslmode = (string) ($postgres['sslmode'] ?? 'require'); // Forzamos require para Neon
    $options = trim((string) ($postgres['options'] ?? ''));

    // Validación básica de parámetros críticos
    if ($host === '' || $dbname === '' || $user === '') {
        throw new RuntimeException('La configuración de PostgreSQL está incompleta.');
    }

    /**
     * Lógica de Endpoint para Neon:
     * Al conectarse vía PDO, Neon requiere que el ID del endpoint se pase explícitamente.
     * Si no se define en el config, lo extraemos automáticamente del host.
     */
    if ($options === '' && preg_match('/^(ep-[^.]+)\./i', $host, $matches) === 1) {
        // Formato requerido por el driver pgsql de PHP para Neon[cite: 7]
        $options = "--endpoint=" . $matches[1];
    }

    // Construcción del DSN (Data Source Name)[cite: 7]
    $dsnParts = [
        sprintf('host=%s', $host),
        sprintf('port=%d', $port),
        sprintf('dbname=%s', $dbname),
        sprintf('sslmode=%s', $sslmode),
    ];

    $dsn = 'pgsql:' . implode(';', $dsnParts);

    // Si tenemos el endpoint (options), lo concatenamos al final del DSN[cite: 7]
    if ($options !== '') {
        $dsn .= sprintf(";options='%s'", $options);
    }

    try {
        return new PDO($dsn, $user, $password, [
            PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, // Reportar errores como excepciones[cite: 7]
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, // Resultados como array asociativo[cite: 7]
            PDO::ATTR_TIMEOUT => 5, // Timeout corto para detectar fallos de red rápido
        ]);
    } catch (PDOException $e) {
        // En producción, lanzamos un error genérico pero registramos el detalle técnico[cite: 7]
        throw new RuntimeException("Error de conexión a la base de datos: " . $e->getMessage());
    }
}