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

        $htmlBody = "
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { margin: 0; padding: 0; background-color: #ffffff; font-family: 'Segoe UI', Tahoma, sans-serif; -webkit-font-smoothing: antialiased; }
                .email-wrapper { background-color: #f8fafc; padding: 60px 20px; }
                .email-container { max-width: 620px; margin: 0 auto; background: #ffffff; border-radius: 32px; overflow: hidden; border: 1px solid #eef2f6; box-shadow: 0 40px 80px -20px rgba(15, 23, 42, 0.05); }
                
                .header { 
                    padding: 55px 50px 45px; 
                    background: #ffffff;
                    text-align: left;
                    border-bottom: 1px solid #f1f5f9;
                }
                .logo { height: 32px; width: auto; margin-bottom: 30px; }
                .main-title { color: #0f172a; font-size: 24px; font-weight: 300; margin: 0; letter-spacing: -0.8px; }
                .weight-800 { font-weight: 800; }

                .content { padding: 50px; }
                .data-table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
                .label { font-size: 10px; font-weight: 800; color: #94a3b8; text-transform: uppercase; letter-spacing: 3px; padding-bottom: 12px; }
                .value { font-size: 16px; color: #0f172a; font-weight: 500; padding-bottom: 35px; }
                
                /* DISEÑO ABIERTO SIN CUADRO (ESTILO IMAGEN) */
                .message-container {
                    margin-top: 10px;                    
                }
                .message-label {
                    font-size: 10px;
                    font-weight: 800;
                    color: #65789A;
                    text-transform: uppercase;
                    letter-spacing: 3px;
                    margin-bottom: 25px;
                    display: block;
                }
                .message-text { 
                    color: #334155; 
                    font-size: 16px; 
                    line-height: 1.9; 
                    margin: 0;
                    font-weight: 400;
                }
                
                .footer { padding: 40px 50px; background: #ffffff; text-align: left; border-top: 1px solid #f1f5f9; }
                .footer-brand { font-size: 13px; font-weight: 800; color: #0f172a; letter-spacing: 1px; text-transform: uppercase; }
            </style>
        </head>
        <body>
            <div class='email-wrapper'>
                <div class='email-container'>
                    <div class='header'>
                        <img src='$logoUrl' alt='Falcon Ventures' class='logo'>
                        <h1 class='main-title'>Nuevo <span class='weight-800'>Mensaje</span> Recibido</h1>
                    </div>
                    
                    <div class='content'>
                        <table class='data-table'>
                            <tr><td class='label'>Remitente</td></tr>
                            <tr><td class='value'>$nombre</td></tr>
                            <tr><td class='label'>Email de contacto</td></tr>
                            <tr><td class='value'>$replyTo</td></tr>
                        </table>

                        <div class='message-container'>
                            <span class='message-label'>Mensaje:</span>
                            <p class='message-text'>$mensaje</p>
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