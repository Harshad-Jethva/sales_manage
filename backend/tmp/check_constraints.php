<?php
header("Content-Type: text/plain");
$host = "localhost";
$db_name = "sales_manage";
$username = "postgres";
$password = "Harshad@2005";

try {
    $conn = new PDO("pgsql:host=$host;dbname=$db_name", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    $stmt = $conn->prepare("
        SELECT conname, pg_get_constraintdef(oid) 
        FROM pg_constraint 
        WHERE conrelid = 'orders'::regclass AND contype = 'c'
    ");
    $stmt->execute();
    $constraints = $stmt->fetchAll(PDO::FETCH_ASSOC);
    foreach($constraints as $row) {
        echo $row['conname'] . ": " . $row['pg_get_constraintdef'] . "\n";
    }
} catch(PDOException $e) {
    echo $e->getMessage();
}
?>
