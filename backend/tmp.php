<?php
$conn = new PDO('pgsql:host=localhost;dbname=sales_manage', 'postgres', 'Harshad@2005');
$stmt = $conn->query("SELECT column_name FROM information_schema.columns WHERE table_name = 'orders'");
while($row = $stmt->fetch()) {
    echo $row['column_name'] . PHP_EOL;
}
?>
