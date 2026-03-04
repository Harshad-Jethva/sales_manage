<?php
try {
  $host = "localhost";
  $db_name = "sales_manage";
  $username = "postgres";
  $password = "Harshad@2005";
  $conn = new PDO("pgsql:host=$host;dbname=$db_name", $username, $password);
  $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
  $conn->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);

  $stmt = $conn->prepare("SELECT id, name, username, role FROM users");
  $stmt->execute();
  $users = $stmt->fetchAll(PDO::FETCH_ASSOC);
  file_put_contents('pg_users_output.json', json_encode($users, JSON_PRETTY_PRINT));
} catch (Exception $e) {
  echo $e->getMessage();
}
?>
