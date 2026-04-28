<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'message' => 'Método no permitido']);
    exit;
}

$config = require __DIR__ . '/config.php';

function limpiarTexto(?string $valor): string {
    $valor = trim((string) $valor);
    return nl2br(htmlspecialchars($valor, ENT_QUOTES, 'UTF-8'));
}

function obtenerFechaHoraMexico(): array {
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

function leerRespuesta($socket): string {
    $respuesta = '';
    while (($linea = fgets($socket, 515)) !== false) {
        $respuesta .= $linea;
        if (isset($linea[3]) && $linea[3] === ' ') break;
    }
    return $respuesta;
}

function enviarComando($socket, string $comando, array $codigosEsperados): string {
    fwrite($socket, $comando . "\r\n");
    $respuesta = leerRespuesta($socket);
    $codigo = (int) substr($respuesta, 0, 3);
    if (!in_array($codigo, $codigosEsperados, true)) {
        throw new RuntimeException('Error SMTP: ' . trim($respuesta));
    }
    return $respuesta;
}

function enviarCorreoSMTP(array $config, string $replyTo, string $nombre, string $mensaje): void {
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
        leerRespuesta($socket);
        enviarComando($socket, 'EHLO localhost', [250]);
        enviarComando($socket, 'STARTTLS', [220]);
        if (!stream_socket_enable_crypto($socket, true, STREAM_CRYPTO_METHOD_TLS_CLIENT)) {
            throw new RuntimeException('No se pudo iniciar TLS');
        }

        enviarComando($socket, 'EHLO localhost', [250]);
        enviarComando($socket, 'AUTH LOGIN', [334]);
        enviarComando($socket, base64_encode($user), [334]);
        enviarComando($socket, base64_encode($pass), [235]);
        enviarComando($socket, 'MAIL FROM:<' . $fromEmail . '>', [250]);

        foreach ($toEmails as $destinatario) {
            enviarComando($socket, 'RCPT TO:<' . $destinatario . '>', [250, 251]);
        }

        enviarComando($socket, 'DATA', [354]);

        $subject = 'Notificación de Consulta: ' . $nombre . ' - Falcon Ventures';
        $logoUrl = "https://static.wixstatic.com/media/423b16_75aaf836c99a47dbbac5fedc906ace3e~mv2.png/v1/crop/x_0,y_170,w_3000,h_733/fill/w_532,h_130,al_c,q_85,usm_0.66_1.00_0.01,enc_avif,quality_auto/Color%20logo%20-%20no%20background_edited.png";
        $fechaHora = obtenerFechaHoraMexico();

        $htmlBody = "
        <!DOCTYPE html>
        <html lang='es'>
        <head>
            <meta http-equiv='Content-Type' content='text/html; charset=UTF-8'>
            <meta name='viewport' content='width=device-width, initial-scale=1.0'>
            <title>$subject</title>
        </head>
        <body style='margin:0; padding:0; background-color:#f8fafc;'>
            <table role='presentation' cellpadding='0' cellspacing='0' border='0' width='100%' style='border-collapse:collapse; background-color:#f8fafc; mso-table-lspace:0pt; mso-table-rspace:0pt;'>
                <tr>
                    <td align='center' style='padding:32px 16px;'>
                        <table role='presentation' cellpadding='0' cellspacing='0' border='0' width='620' style='width:620px; max-width:620px; border-collapse:collapse; background-color:#ffffff; border:1px solid #e2e8f0; mso-table-lspace:0pt; mso-table-rspace:0pt;'>
                            <tr>
                                <td style='padding:36px 40px 28px 40px; border-bottom:1px solid #e2e8f0;'>
                                    <img src='$logoUrl' alt='Falcon Ventures' width='220' style='display:block; width:220px; max-width:100%; height:auto; border:0; margin:0 0 24px 0;'>
                                    <div style='font-family:Segoe UI, Tahoma, Arial, sans-serif; font-size:28px; line-height:36px; color:#0f172a; font-weight:400;'>
                                        Nuevo <strong style='font-weight:800;'>Mensaje</strong> Recibido
                                    </div>
                                </td>
                            </tr>
                            <tr>
                                <td style='padding:36px 40px 16px 40px;'>
                                    <table role='presentation' cellpadding='0' cellspacing='0' border='0' width='100%' style='border-collapse:collapse; mso-table-lspace:0pt; mso-table-rspace:0pt;'>
                                        <tr>
                                            <td style='padding:0 0 8px 0; font-family:Segoe UI, Tahoma, Arial, sans-serif; font-size:11px; line-height:16px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:1px;'>Fecha</td>
                                        </tr>
                                        <tr>
                                            <td style='padding:0 0 24px 0; font-family:Segoe UI, Tahoma, Arial, sans-serif; font-size:16px; line-height:24px; color:#0f172a;'> {$fechaHora['fecha']} </td>
                                        </tr>
                                        <tr>
                                            <td style='padding:0 0 8px 0; font-family:Segoe UI, Tahoma, Arial, sans-serif; font-size:11px; line-height:16px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:1px;'>Hora</td>
                                        </tr>
                                        <tr>
                                            <td style='padding:0 0 24px 0; font-family:Segoe UI, Tahoma, Arial, sans-serif; font-size:16px; line-height:24px; color:#0f172a;'> {$fechaHora['hora']} (Mexico City)</td>
                                        </tr>
                                        <tr>
                                            <td style='padding:0 0 8px 0; font-family:Segoe UI, Tahoma, Arial, sans-serif; font-size:11px; line-height:16px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:1px;'>Remitente</td>
                                        </tr>
                                        <tr>
                                            <td style='padding:0 0 24px 0; font-family:Segoe UI, Tahoma, Arial, sans-serif; font-size:16px; line-height:24px; color:#0f172a;'>$nombre</td>
                                        </tr>
                                        <tr>
                                            <td style='padding:0 0 8px 0; font-family:Segoe UI, Tahoma, Arial, sans-serif; font-size:11px; line-height:16px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:1px;'>Email de contacto</td>
                                        </tr>
                                        <tr>
                                            <td style='padding:0 0 24px 0; font-family:Segoe UI, Tahoma, Arial, sans-serif; font-size:16px; line-height:24px; color:#2563eb;'>
                                                <a href='mailto:$replyTo' style='color:#2563eb; text-decoration:underline;'>$replyTo</a>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td style='padding:0 40px 36px 40px;'>
                                    <table role='presentation' cellpadding='0' cellspacing='0' border='0' width='100%' style='border-collapse:collapse; border:1px solid #e2e8f0; background-color:#f8fafc; mso-table-lspace:0pt; mso-table-rspace:0pt;'>
                                        <tr>
                                            <td style='padding:18px 20px 10px 20px; font-family:Segoe UI, Tahoma, Arial, sans-serif; font-size:11px; line-height:16px; font-weight:700; color:#64748b; text-transform:uppercase; letter-spacing:1px;'>Mensaje</td>
                                        </tr>
                                        <tr>
                                            <td style='padding:0 20px 20px 20px; font-family:Segoe UI, Tahoma, Arial, sans-serif; font-size:16px; line-height:28px; color:#334155;'>$mensaje</td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                            <tr>
                                <td style='padding:20px 40px; border-top:1px solid #e2e8f0; font-family:Segoe UI, Tahoma, Arial, sans-serif; font-size:12px; line-height:18px; font-weight:700; color:#0f172a; text-transform:uppercase; letter-spacing:1px;'>
                                    Falcon Ventures • 2026
                                </td>
                            </tr>
                        </table>
                    </td>
                </tr>
            </table>
        </body>
        </html>";

        $headers = [
            'From: ' . sprintf('"%s" <%s>', addslashes($fromName), $fromEmail),
            'Reply-To: ' . $replyTo,
            'MIME-Version: 1.0',
            'Content-Type: text/html; charset=UTF-8',
        ];

        $payload = implode("\r\n", [
            'Subject: =?UTF-8?B?' . base64_encode($subject) . '?=',
            ...$headers,
            '',
            $htmlBody,
            '.'
        ]);

        fwrite($socket, $payload . "\r\n");
        $finalResp = leerRespuesta($socket);
        if ((int) substr($finalResp, 0, 3) !== 250) throw new RuntimeException('Error SMTP');
        enviarComando($socket, 'QUIT', [221]);
    } finally {
        if (is_resource($socket)) fclose($socket);
    }
}

$nombreRaw = $_POST['name'] ?? '';
$correo = filter_var(trim((string) ($_POST['email'] ?? '')), FILTER_VALIDATE_EMAIL);
$mensajeRaw = $_POST['message'] ?? '';

if (empty($nombreRaw) || $correo === false || empty($mensajeRaw)) {
    http_response_code(422);
    echo json_encode(['ok' => false, 'message' => 'Datos inválidos']);
    exit;
}

$nombre = htmlspecialchars(trim((string)$nombreRaw), ENT_QUOTES, 'UTF-8');
$mensaje = limpiarTexto($mensajeRaw);

try {
    enviarCorreoSMTP($config, $correo, $nombre, $mensaje);
    echo json_encode(['ok' => true, 'message' => 'Enviado con éxito']);
} catch (Throwable $error) {
    http_response_code(500);
    echo json_encode(['ok' => false, 'message' => 'Error en servidor']);
}
