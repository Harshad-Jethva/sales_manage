<?php
require 'config/db.php';
$conn->exec("UPDATE clients SET area = 'North Zone' WHERE id = 1");
$conn->exec("UPDATE clients SET area = 'South Zone' WHERE id = 2");
$conn->exec("UPDATE clients SET area = 'East Zone' WHERE id = 3");
$conn->exec("UPDATE clients SET area = 'West Zone' WHERE id > 3");

$stmt2 = $conn->query('SELECT DISTINCT area FROM clients');
print_r($stmt2->fetchAll(PDO::FETCH_ASSOC));
?>
