<?php
/**
 * Traitement du formulaire de contact — Melting Consulting
 * Envoie la demande par email via mail() (hébergement LWS).
 *
 * Répond en JSON quand il est appelé en AJAX (js/form.js),
 * sinon redirige vers la page d'accueil (navigateur sans JavaScript).
 */

// ========================================
// CONFIGURATION
// ========================================
const MAIL_TO      = 'contact@meltingconsulting.com';
// L'expéditeur doit être une adresse existante du domaine hébergé chez LWS, sinon le mail est rejeté.
const MAIL_FROM    = 'contact@meltingconsulting.com';
const MAIL_SUBJECT = 'Nouvelle demande de contact – site Melting Consulting';
const MIN_DELAY_BETWEEN_SENDS = 30; // secondes, anti-envoi en rafale

const INTERESTS = [
    'communication' => 'Conseil en communication, Relations publiques et intermédiations d’affaires',
    'investment'    => 'Conseil en investissement',
    'audiovisual'   => 'Production audiovisuelle (Melting Prod)',
    'business'      => 'Développement commercial international',
    'sports'        => 'Management sportif',
];

// ========================================
// HELPERS
// ========================================
function wants_json(): bool
{
    return str_contains($_SERVER['HTTP_ACCEPT'] ?? '', 'application/json');
}

function respond(bool $ok, string $code, int $status = 200): never
{
    if (wants_json()) {
        http_response_code($status);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['ok' => $ok, 'code' => $code]);
    } else {
        header('Location: index.html?contact=' . ($ok ? 'ok' : 'error') . '#contact', true, 303);
    }
    exit;
}

/** Texte sur une ligne (empêche l'injection d'en-têtes). */
function field_line(string $name, int $max): string
{
    $value = trim((string) ($_POST[$name] ?? ''));
    $value = preg_replace('/[\r\n\t]+/', ' ', $value);
    return mb_substr($value, 0, $max);
}

function field_text(string $name, int $max): string
{
    $value = trim((string) ($_POST[$name] ?? ''));
    $value = str_replace("\r\n", "\n", $value);
    return mb_substr($value, 0, $max);
}

function encode_header(string $text): string
{
    return '=?UTF-8?B?' . base64_encode($text) . '?=';
}

// ========================================
// TRAITEMENT
// ========================================
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    respond(false, 'method', 405);
}

// Honeypot : un robot remplit ce champ invisible → on fait semblant que tout va bien.
if (!empty($_POST['_honey'])) {
    respond(true, 'sent');
}

session_start();
$now = time();
if (isset($_SESSION['contact_last_sent']) && $now - $_SESSION['contact_last_sent'] < MIN_DELAY_BETWEEN_SENDS) {
    respond(false, 'too_fast', 429);
}

$name     = field_line('name', 120);
$company  = field_line('company', 150);
$email    = field_line('email', 180);
$phone    = field_line('phone', 40);
$interest = field_line('interest', 40);
$message  = field_text('message', 5000);

if ($name === '' || $email === '' || $message === '') {
    respond(false, 'required', 422);
}
if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, 'invalid_email', 422);
}

$interestLabel = INTERESTS[$interest] ?? 'Non précisé';

$body = "Nouvelle demande reçue depuis le formulaire de contact du site.\n\n"
      . "Nom complet : {$name}\n"
      . 'Entreprise  : ' . ($company !== '' ? $company : '—') . "\n"
      . "Email       : {$email}\n"
      . 'Téléphone   : ' . ($phone !== '' ? $phone : '—') . "\n"
      . "Domaine     : {$interestLabel}\n\n"
      . "Message :\n"
      . "----------------------------------------\n"
      . $message . "\n"
      . "----------------------------------------\n\n"
      . 'Envoyé le ' . date('d/m/Y à H:i') . ' — IP : ' . ($_SERVER['REMOTE_ADDR'] ?? '?') . "\n"
      . "Répondez directement à ce mail pour écrire à {$name}.\n";

$headers = [
    'From: ' . encode_header('Site Melting Consulting') . ' <' . MAIL_FROM . '>',
    'Reply-To: ' . encode_header($name) . " <{$email}>",
    'MIME-Version: 1.0',
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 8bit',
    'X-Mailer: PHP/' . PHP_VERSION,
];

$sent = mail(MAIL_TO, encode_header(MAIL_SUBJECT), $body, implode("\r\n", $headers), '-f' . MAIL_FROM);

if (!$sent) {
    respond(false, 'server', 500);
}

$_SESSION['contact_last_sent'] = $now;
respond(true, 'sent');
