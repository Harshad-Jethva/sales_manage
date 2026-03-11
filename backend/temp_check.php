<?php
require_once 'config/db.php';

try {
    echo "Clients matching harshad:\n";
    $stmt = $conn->query("SELECT id, name, phone, outstanding_balance FROM clients WHERE name ILIKE '%harshad%'");
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

    echo "\nAll clients with balance > 0:\n";
    $stmt = $conn->query("SELECT id, name, phone, outstanding_balance FROM clients WHERE outstanding_balance > 0");
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

    echo "\nBills with credit:\n";
    $stmt = $conn->query("SELECT id, client_id, bill_number, total_amount, paid_amount, payment_method, due_date FROM bills WHERE payment_method ILIKE '%credit%' LIMIT 10");
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

    echo "\nOverdue bills check:\n";
    $stmt = $conn->query("
        SELECT 
            b.id as bill_id, 
            c.name as client_name,
            b.payment_method,
            b.total_amount,
            b.paid_amount,
            b.due_date,
            CURRENT_DATE - b.due_date as days_overdue
        FROM bills b JOIN clients c ON b.client_id = c.id 
        WHERE LOWER(b.payment_method) = 'credit'
    ");
    print_r($stmt->fetchAll(PDO::FETCH_ASSOC));

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
