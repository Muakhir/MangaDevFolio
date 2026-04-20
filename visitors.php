<?php
error_reporting(0);
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');

$dbFile = __DIR__ . '/data/visitors.db';
$dbDir = dirname($dbFile);

if (!is_dir($dbDir)) {
    mkdir($dbDir, 0755, true);
}

$db = new SQLite3($dbFile);
$db->exec('PRAGMA journal_mode=WAL');
$db->exec('CREATE TABLE IF NOT EXISTS visitors (
    id TEXT PRIMARY KEY,
    last_seen INTEGER NOT NULL
)');

// Visitor ID from cookie or generate new
$visitorId = $_COOKIE['vid'] ?? bin2hex(random_bytes(16));
setcookie('vid', $visitorId, [
    'expires' => time() + 86400 * 30,
    'path' => '/',
    'httponly' => true,
    'samesite' => 'Lax',
]);

$now = time();

// Upsert this visitor
$stmt = $db->prepare('INSERT INTO visitors (id, last_seen) VALUES (:id, :now) ON CONFLICT(id) DO UPDATE SET last_seen = :now');
$stmt->bindValue(':id', $visitorId, SQLITE3_TEXT);
$stmt->bindValue(':now', $now, SQLITE3_INTEGER);
$stmt->execute();

// Purge stale visitors (inactive > 30 seconds)
$cutoff = $now - 30;
$db->exec("DELETE FROM visitors WHERE last_seen < $cutoff");

// Count active visitors
$count = $db->querySingle('SELECT COUNT(*) FROM visitors');

$db->close();

echo json_encode(['count' => (int)$count]);
