<?php
declare(strict_types=1);

function envOrDefault(string $key, mixed $default = ''): mixed
{
    $value = getenv($key);
    return ($value === false || $value === '') ? $default : $value;
}

function envList(string $key, array $default = []): array
{
    $value = getenv($key);
    if ($value === false || trim($value) === '') {
        return $default;
    }

    return array_values(array_filter(array_map(
        static fn(string $item): string => trim($item),
        explode(',', $value)
    )));
}

return [
    'smtp_host' => (string) envOrDefault('SMTP_HOST', 'smtp.office365.com'),
    'smtp_port' => (int) envOrDefault('SMTP_PORT', 587),
    'smtp_encryption' => (string) envOrDefault('SMTP_ENCRYPTION', 'tls'),
    'smtp_timeout' => (int) envOrDefault('SMTP_TIMEOUT', 20),
    'smtp_user' => (string) envOrDefault('SMTP_USER'),
    'smtp_pass' => (string) envOrDefault('SMTP_PASS'),
    'from_email' => (string) envOrDefault('FROM_EMAIL'),
    'from_name' => (string) envOrDefault('FROM_NAME', 'Falcon Ventures Web'),
    'to_emails' => envList('TO_EMAILS'),
];
