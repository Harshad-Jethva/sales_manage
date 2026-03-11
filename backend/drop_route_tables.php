<?php
require 'config/db.php';
$conn->exec("DROP TABLE IF EXISTS route_clients CASCADE");
$conn->exec("DROP TABLE IF EXISTS route_plans CASCADE");
echo "Tables dropped.\n";
?>
