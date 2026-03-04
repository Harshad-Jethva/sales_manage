<?php
require_once 'config/db.php';
$stmt = $conn->query("SELECT relname FROM pg_class WHERE relkind = 'S'");
while ($row = $stmt->fetch()) {
    echo $row['relname'] . "\n";
}
?>
