<?php
declare(strict_types=1);

return [
    'smtp_host' => 'smtp.office365.com',
    'smtp_port' => 587,
    'smtp_encryption' => 'tls',
    'smtp_timeout' => 20,
    'smtp_user' => 'admin@zascita.com',
    'smtp_pass' => 'C0mercial.2026#',
    'from_email' => 'admin@zascita.com',
    'from_name' => 'Zascita Web',
    'to_emails' => [
        'alexis.morales@zascita.com'
    ],
    'postgres' => [
        'host' => 'ep-still-glade-an1bse9o.c-6.us-east-1.aws.neon.tech',
        'port' => 5432,
        'dbname' => 'neondb',
        'user' => 'neondb_owner',
        'password' => 'npg_jFUxmH0ywq1p',
        'sslmode' => 'require', // Neon requiere 'require' para funcionar
    ],
    'login' => [
        'table' => 'users',
        'email_column' => 'email',
        'password_column' => 'password_hash',
        'access_link_column' => 'access_link',
        'company_name_column' => 'company_name',
        'company_logo_column' => 'company_logo_url',
        'active_column' => 'is_active',
    ],
];