<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'message' => 'Método no permitido']);
    exit;
}

$config = require __DIR__ . '/config.php';

function limpiarTextoContacto(?string $valor): string {
    $valor = trim((string) $valor);
    return nl2br(htmlspecialchars($valor, ENT_QUOTES, 'UTF-8'));
}

function obtenerFechaHoraMexicoContacto(): array {
    $timezone = new DateTimeZone('America/Mexico_City');
    $fecha = new DateTimeImmutable('now', $timezone);

    if (class_exists('IntlDateFormatter')) {
        $formatterFecha = new IntlDateFormatter(
            'es_MX',
            IntlDateFormatter::FULL,
            IntlDateFormatter::NONE,
            $timezone->getName(),
            IntlDateFormatter::GREGORIAN,
            "EEEE d 'de' MMMM 'de' y"
        );

        $formatterHora = new IntlDateFormatter(
            'es_MX',
            IntlDateFormatter::NONE,
            IntlDateFormatter::SHORT,
            $timezone->getName(),
            IntlDateFormatter::GREGORIAN,
            'h:mm a'
        );

        return [
            'fecha' => mb_strtolower((string) $formatterFecha->format($fecha), 'UTF-8'),
            'hora' => mb_strtolower((string) $formatterHora->format($fecha), 'UTF-8'),
        ];
    }

    $dias = ['domingo', 'lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado'];
    $meses = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

    return [
        'fecha' => $dias[(int) $fecha->format('w')] . ' ' . $fecha->format('j') . ' de ' . $meses[(int) $fecha->format('n') - 1] . ' de ' . $fecha->format('Y'),
        'hora' => strtolower($fecha->format('g:i a')),
    ];
}

function leerRespuestaContacto($socket): string {
    $respuesta = '';
    while (($linea = fgets($socket, 515)) !== false) {
        $respuesta .= $linea;
        if (isset($linea[3]) && $linea[3] === ' ') break;
    }
    return $respuesta;
}

function enviarComandoContacto($socket, string $comando, array $codigosEsperados): string {
    fwrite($socket, $comando . "\r\n");
    $respuesta = leerRespuestaContacto($socket);
    $codigo = (int) substr($respuesta, 0, 3);
    if (!in_array($codigo, $codigosEsperados, true)) {
        throw new RuntimeException('Error SMTP: ' . trim($respuesta));
    }
    return $respuesta;
}

function enviarCorreoSMTPContacto(array $config, array $payload): void {
    $host = (string) ($config['smtp_host'] ?? '');
    $port = (int) ($config['smtp_port'] ?? 587);
    $user = (string) ($config['smtp_user'] ?? '');
    $pass = (string) ($config['smtp_pass'] ?? '');
    $fromEmail = (string) ($config['from_email'] ?? $user);
    $fromName = (string) ($config['from_name'] ?? 'Falcon Ventures');
    $toEmails = $config['to_emails'] ?? [];
    $timeout = (int) ($config['smtp_timeout'] ?? 20);

    $socket = stream_socket_client(sprintf('tcp://%s:%d', $host, $port), $errno, $errstr, $timeout);
    if (!$socket) throw new RuntimeException('Conexión fallida: ' . $errstr);

    stream_set_timeout($socket, $timeout);

    try {
        leerRespuestaContacto($socket);
        enviarComandoContacto($socket, 'EHLO localhost', [250]);
        enviarComandoContacto($socket, 'STARTTLS', [220]);
        if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
            throw new RuntimeException('No se pudo iniciar TLS');
        }

        enviarComandoContacto($socket, 'EHLO localhost', [250]);
        enviarComandoContacto($socket, 'AUTH LOGIN', [334]);
        enviarComandoContacto($socket, base64_encode($user), [334]);
        enviarComandoContacto($socket, base64_encode($pass), [235]);
        enviarComandoContacto($socket, 'MAIL FROM:<' . $fromEmail . '>', [250]);

        foreach ($toEmails as $destinatario) {
            enviarComandoContacto($socket, 'RCPT TO:<' . $destinatario . '>', [250, 251]);
        }

        enviarComandoContacto($socket, 'DATA', [354]);

        $subject = 'Notificación de Contacto: ' . $payload['first_name'] . ' ' . $payload['last_name'] . ' - Falcon Ventures';
        $logoUrl = "https://static.wixstatic.com/media/423b16_75aaf836c99a47dbbac5fedc906ace3e~mv2.png/v1/crop/x_0,y_170,w_3000,h_733/fill/w_532,h_130,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Color%20logo%20-%20no%20background_edited.png";
        $fechaHora = obtenerFechaHoraMexicoContacto();

        $telefonoHtml = $payload['phone'] !== '' ? "
                            <tr><td class='label'>Teléfono</td></tr>
                            <tr><td class='value'>{$payload['phone']}</td></tr>" : '';

        $htmlBody = "
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { margin: 0; padding: 0; background-color: #ffffff; font-family: 'Segoe UI', Tahoma, sans-serif; -webkit-font-smoothing: antialiased; }
                .email-wrapper { background-color: #f8fafc; padding: 60px 20px; }
                .email-container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 32px; overflow: hidden; border: 1px solid #eef2f6; box-shadow: 0 40px 80px -20px rgba(15, 23, 42, 0.05); }
                .header { padding: 55px 50px 45px; background: #ffffff; text-align: left; border-bottom: 1px solid #f1f5f9; }
                .logo { height: 32px; width: auto; margin-bottom: 30px; }
                .main-title { color: #0f172a; font-size: 24px; font-weight: 300; margin: 0; letter-spacing: -0.8px; }
                .weight-800 { font-weight: 800; }
                .content { padding: 50px; }
                .data-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
                .label { font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 3px; padding-bottom: 12px; }
                .value { font-size: 16px; color: #0f172a; font-weight: 500; padding-bottom: 35px; }
                .message-container { margin-top: 10px; }
                .message-label { font-size: 10px; font-weight: 800; color: #65789A; text-transform: uppercase; letter-spacing: 3px; margin-bottom: 25px; display: block; }
                .message-text { color: #334155; font-size: 16px; line-height: 1.9; margin: 0; font-weight: 400; }
                .footer { padding: 40px 50px; background: #ffffff; text-align: left; border-top: 1px solid #f1f5f9; }
                .footer-brand { font-size: 13px; font-weight: 800; color: #0f172a; letter-spacing: 1px; text-transform: uppercase; }
            </style>
        </head>
        <body>
            <div class='email-wrapper'>
                <div class='email-container'>
                    <div class='header'>
                        <img src='$logoUrl' alt='Falcon Ventures' class='logo'>
                        <h1 class='main-title'>Nuevo <span class='weight-800'>Mensaje de Contacto</span></h1>
                    </div>
                    <div class='content'>
                        <table class='data-table'>
                            <tr><td class='label'>Fecha</td></tr>
                            <tr><td class='value'>{$fechaHora['fecha']}</td></tr>
                            <tr><td class='label'>Hora</td></tr>
                            <tr><td class='value'>{$fechaHora['hora']} (Mexico City)</td></tr>
                            <tr><td class='label'>Nombre</td></tr>
                            <tr><td class='value'>{$payload['first_name']} {$payload['last_name']}</td></tr>
                            <tr><td class='label'>Email de contacto</td></tr>
                            <tr><td class='value'>{$payload['email']}</td></tr>
                            $telefonoHtml
                            <tr><td class='label'>Asunto</td></tr>
                            <tr><td class='value'>{$payload['subject']}</td></tr>
                        </table>
                        <div class='message-container'>
                            <span class='message-label'>Mensaje:</span>
                            <p class='message-text'>{$payload['message']}</p>
                        </div>
                    </div>
                    <div class='footer'>
                        <div class='footer-brand'>Falcon Ventures &bull; 2026</div>
                    </div>
                </div>
            </div>
        </body>
        </html>";

        $headers = [
            'From: ' . sprintf('"%s" <%s>', addslashes($fromName), $fromEmail),
            'Reply-To: ' . $payload['email'],
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=UTF-8',
        ];

        $payloadMail = implode("\r\n", [
            'Subject: =?UTF-8?B?' . base64_encode($subject) . '?=',
            ...$headers,
            '',
            $htmlBody,
            '.'
        ]);

        fwrite($socket, $payloadMail . "\r\n");
        $finalResp = leerRespuestaContacto($socket);
        if ((int) substr($finalResp, 0, 3) !== 250) throw new RuntimeException('Error SMTP');
        enviarComandoContacto($socket, 'QUIT', [221]);
    } finally {
        if (is_resource($socket)) fclose($socket);
    }
}

$firstName = trim((string) ($_POST['firstName'] ?? ''));
$lastName = trim((string) ($_POST['lastName'] ?? ''));
$email = filter_var(trim((string) ($_POST['email'] ?? '')), FILTER_VALIDATE_EMAIL);
$phone = preg_replace('/\D+/', '', (string) ($_POST['phone'] ?? '')) ?? '';
$subjectMap = [
    'investment' => 'Oportunidad de Inversión',
    'consulting' => 'Consultoría Estratégica',
    'press' => 'Prensa y Medios',
    'other' => 'Otro',
];
$subjectKey = trim((string) ($_POST['subject'] ?? ''));
$message = trim((string) ($_POST['message'] ?? ''));

if ($firstName === '' || $lastName === '' || $email === false || $subjectKey === '' || $message === '') {
    http_response_code(422);
    echo json_encode(['ok' => false, 'message' => 'Datos inválidos']);
    exit;
}

if ($phone !== '' && strlen($phone) !== 10) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'message' => 'Teléfono inválido']);
    exit;
}

$payload = [
    'first_name' => htmlspecialchars($firstName, ENT_QUOTES, 'UTF-8'),
    'last_name' => htmlspecialchars($lastName, ENT_QUOTES, 'UTF-8'),
    'email' => $email,
    'phone' => htmlspecialchars($phone, ENT_QUOTES, 'UTF-8'),
    'subject' => htmlspecialchars($subjectMap[$subjectKey] ?? $subjectKey, ENT_QUOTES, 'UTF-8'),
    'message' => limpiarTextoContacto($message),
];

try {
    enviarCorreoSMTPContacto($config, $payload);
    echo json_encode(['ok' => true, 'message' => 'Enviado con éxito']);
} catch (Throwable $error) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'message' => 'Error en servidor']);
}
