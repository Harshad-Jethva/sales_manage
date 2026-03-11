<?php
require_once '../config/db.php';
try {
    $conn->exec("ALTER TABLE collection_receipts ADD COLUMN receipt_number VARCHAR(50) NULL;");
    echo "Column added.";
} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
?>
