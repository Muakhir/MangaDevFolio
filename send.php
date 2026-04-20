<?php
error_reporting(0);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Content-Type');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Load .env
$envFile = __DIR__ . '/.env';
if (file_exists($envFile)) {
    foreach (file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) as $line) {
        if (str_starts_with($line, '#')) continue;
        [$key, $val] = explode('=', $line, 2);
        $_ENV[trim($key)] = trim($val);
    }
}

// PHPMailer
require __DIR__ . '/phpmailer/Exception.php';
require __DIR__ . '/phpmailer/PHPMailer.php';
require __DIR__ . '/phpmailer/SMTP.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

$input = json_decode(file_get_contents('php://input'), true);

if (!$input) {
    echo json_encode(['success' => false, 'message' => 'Invalid request data']);
    exit;
}

$name = trim(htmlspecialchars($input['name'] ?? '', ENT_QUOTES, 'UTF-8'));
$email = trim(filter_var($input['email'] ?? '', FILTER_SANITIZE_EMAIL));
$subject = trim(htmlspecialchars($input['subject'] ?? '', ENT_QUOTES, 'UTF-8'));
$message = trim(htmlspecialchars($input['message'] ?? '', ENT_QUOTES, 'UTF-8'));

// Validation
$errors = [];
if (empty($name) || strlen($name) < 2) {
    $errors[] = 'Name is required (min 2 characters)';
}
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'Valid email is required';
}
if (empty($subject) || strlen($subject) < 3) {
    $errors[] = 'Subject is required (min 3 characters)';
}
if (empty($message) || strlen($message) < 10) {
    $errors[] = 'Message is required (min 10 characters)';
}
if (strlen($name) > 100 || strlen($subject) > 200 || strlen($message) > 5000) {
    $errors[] = 'Input exceeds maximum length';
}

if (!empty($errors)) {
    echo json_encode(['success' => false, 'message' => implode('. ', $errors)]);
    exit;
}

$to = 'almuakhirjones@gmail.com';
$emailSubject = "Portfolio Contact: $subject";
$messageNl = nl2br($message);
$date = date('Y.m.d — H:i');

$htmlBody = <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>{$emailSubject}</title>
<link href="https://fonts.googleapis.com/css2?family=Shippori+Mincho:wght@400;700;800&family=Noto+Serif+JP:wght@400;700;900&display=swap" rel="stylesheet"/>
</head>
<body style="margin:0; padding:0; background-color:#0a0a0f; font-family:'Shippori Mincho','Noto Serif JP',Georgia,serif;">

<!-- Outer wrapper -->
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#0a0a0f; padding:40px 20px;">
<tr><td align="center">

<!-- Main container -->
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%;">

<!-- Header with asanoha-style border top -->
<tr>
<td style="background: linear-gradient(90deg, #c23030 0%, #8b1a1a 50%, #c23030 100%); height:4px; border-radius:2px;"></td>
</tr>

<!-- Chapter header -->
<tr>
<td style="background-color:#0f0f14; padding:30px 40px; text-align:center; border-left:1px solid rgba(194,48,48,0.2); border-right:1px solid rgba(194,48,48,0.2);">
  <p style="margin:0; font-size:11px; letter-spacing:6px; color:#c23030; text-transform:uppercase;">最終章 — Final Chapter</p>
  <h1 style="margin:10px 0 0; font-size:28px; font-weight:800; color:#f5f0e8; letter-spacing:4px;">New Message</h1>
  <p style="margin:8px 0 0; font-size:11px; letter-spacing:3px; color:rgba(245,240,232,0.3);">{$date}</p>
</td>
</tr>

<!-- Decorative border -->
<tr>
<td style="background-color:#0f0f14; padding:0 40px; border-left:1px solid rgba(194,48,48,0.2); border-right:1px solid rgba(194,48,48,0.2);">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td style="border-bottom:1px solid rgba(245,240,232,0.08);"></td>
    </tr>
  </table>
</td>
</tr>

<!-- Content area -->
<tr>
<td style="padding:0; border-left:1px solid rgba(194,48,48,0.2); border-right:1px solid rgba(194,48,48,0.2);">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
  <tr><td style="padding:30px 40px; background-color:#0f0f14;">

    <!-- Sender card -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:rgba(245,240,232,0.03); border:1px solid rgba(245,240,232,0.08); margin-bottom:24px;">
    <tr><td style="padding:20px 24px;">
      <p style="margin:0 0 4px; font-size:10px; letter-spacing:4px; color:rgba(245,240,232,0.3); text-transform:uppercase;">From</p>
      <p style="margin:0; font-size:18px; font-weight:700; color:#f5f0e8; letter-spacing:2px;">{$name}</p>
      <p style="margin:4px 0 0; font-size:13px; color:#c23030; letter-spacing:1px;">{$email}</p>
    </td></tr>
    </table>

    <!-- Subject -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
    <tr><td>
      <p style="margin:0 0 4px; font-size:10px; letter-spacing:4px; color:rgba(245,240,232,0.3); text-transform:uppercase;">Subject</p>
      <p style="margin:0; font-size:16px; font-weight:700; color:#f5f0e8; letter-spacing:1px; border-left:3px solid #c23030; padding-left:12px;">{$subject}</p>
    </td></tr>
    </table>

    <!-- Message body on paper background -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f0e8; border:2px solid #1a1a1a;">
    <tr><td style="padding:0; position:relative;">
      <!-- Corner accents -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td width="12" height="12" style="border-top:2px solid #c23030; border-left:2px solid #c23030;"></td>
        <td></td>
        <td width="12" height="12" style="border-top:2px solid #c23030; border-right:2px solid #c23030;"></td>
      </tr>
      </table>

      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td style="padding:24px 28px;">
        <p style="margin:0 0 8px; font-size:10px; letter-spacing:4px; color:rgba(26,26,26,0.4); text-transform:uppercase;">Message</p>
        <div style="font-size:14px; line-height:1.8; color:#1a1a1a; letter-spacing:0.3px;">{$messageNl}</div>
      </td></tr>
      </table>

      <!-- Bottom corner accents -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td width="12" height="12" style="border-bottom:2px solid #c23030; border-left:2px solid #c23030;"></td>
        <td></td>
        <td width="12" height="12" style="border-bottom:2px solid #c23030; border-right:2px solid #c23030;"></td>
      </tr>
      </table>
    </td></tr>
    </table>

  </td></tr>
  </table>
</td>
</tr>

<!-- Footer -->
<tr>
<td style="background-color:#0f0f14; padding:24px 40px; text-align:center; border-left:1px solid rgba(194,48,48,0.2); border-right:1px solid rgba(194,48,48,0.2);">
  <!-- Hanko stamp -->
  <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin-bottom:12px;">
  <tr><td style="width:44px; height:44px; border:2px solid #c23030; border-radius:3px; text-align:center; vertical-align:middle;">
    <span style="font-family:'Noto Serif JP',serif; font-size:12px; font-weight:900; color:#c23030; letter-spacing:1px;">開発者</span>
  </td></tr>
  </table>
  <p style="margin:0; font-size:11px; letter-spacing:4px; color:rgba(245,240,232,0.3);">MUAKHIR DEV &copy; 2026</p>
  <p style="margin:6px 0 0; font-size:10px; letter-spacing:2px; color:rgba(245,240,232,0.15);">Sent from MangaDevFolio</p>
</td>
</tr>

<!-- Bottom vermillion border -->
<tr>
<td style="background: linear-gradient(90deg, #c23030 0%, #8b1a1a 50%, #c23030 100%); height:4px; border-radius:2px;"></td>
</tr>

</table>
<!-- /Main container -->

</td></tr>
</table>
<!-- /Outer wrapper -->

</body>
</html>
HTML;

try {
    $mail = new PHPMailer(true);

    // SMTP config from .env
    $mail->isSMTP();
    $mail->Host       = $_ENV['SMTP_HOST'] ?? 'smtp.gmail.com';
    $mail->SMTPAuth   = true;
    $mail->Username   = $_ENV['SMTP_USER'] ?? '';
    $mail->Password   = $_ENV['SMTP_PASS'] ?? '';
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port       = (int)($_ENV['SMTP_PORT'] ?? 587);

    // Recipients
    $mailTo = $_ENV['MAIL_TO'] ?? $to;
    $mail->setFrom($_ENV['SMTP_USER'] ?? $to, 'MangaDevFolio');
    $mail->addAddress($mailTo);
    $mail->addReplyTo($email, $name);

    // Content
    $mail->isHTML(true);
    $mail->CharSet = 'UTF-8';
    $mail->Subject = $emailSubject;
    $mail->Body    = $htmlBody;
    $mail->AltBody = "From: $name ($email)\nSubject: $subject\n\n$message";

    $mail->send();
    echo json_encode(['success' => true, 'message' => 'Message sent successfully']);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => 'Mail error: ' . $mail->ErrorInfo]);
}
