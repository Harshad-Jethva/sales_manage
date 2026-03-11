<?php
require 'e:/xampp/htdocs/sales_manage/backend/config/db.php';
$stmt = $conn->query('SELECT receipt_id, receipt_number, receipt_pdf_path FROM collection_receipts ORDER BY receipt_id DESC LIMIT 5');
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));
?>
