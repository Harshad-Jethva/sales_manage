<?php
$db = new mysqli('localhost', 'root', '', 'sales_manage');
$res = $db->query("SELECT id, name, email, role FROM users");
while($row = $res->fetch_assoc()) {
    print_r($row);
}
?>
