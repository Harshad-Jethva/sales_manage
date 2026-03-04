<?php
header("Content-Type: text/plain");
$host = "localhost";
$db_name = "sales_manage";
$username = "postgres";
$password = "Harshad@2005";

try {
    $conn = new PDO("pgsql:host=$host;dbname=$db_name", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $stmt = $conn->prepare("SELECT column_name FROM information_schema.columns WHERE table_name = 'orders'");
    $stmt->execute();
    $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach($rows as $row) {
        echo $row['column_name'] . "\n";
    }
} catch(PDOException $e) {
    echo $e->getMessage();
}
?>
