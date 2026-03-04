<?php
header("Content-Type: text/plain");
$host = "localhost";
$db_name = "sales_manage";
$username = "postgres";
$password = "Harshad@2005";

try {
    $conn = new PDO("pgsql:host=$host;dbname=$db_name", $username, $password);
    $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    
    // Drop old constraint
    $conn->exec("ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check");
    
    // Add new constraint
    $conn->exec("ALTER TABLE orders ADD CONSTRAINT orders_status_check CHECK (status = ANY (ARRAY['Pending', 'Processing', 'Ready to Dispatch', 'Completed', 'Cancelled', 'Confirmed', 'Delivered']))");
    
    echo "Constraint updated successfully";
} catch(PDOException $e) {
    echo "Error: " . $e->getMessage();
}
?>
