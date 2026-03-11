<?php
require_once 'config/db.php';

try {
    // 1. Assign random due dates to bills that don't have one and are 'Credit'
    // Some overdue (due date < current), some future
    
    // First, verify we have a client and some bills to work with
    $stmt = $conn->query("SELECT id FROM clients LIMIT 1");
    $client = $stmt->fetch();
    
    if (!$client) {
        // Let's create a dummy client
        $conn->exec("INSERT INTO clients (name, phone, outstanding_balance) VALUES ('Test Overdue Client', '9998887776', 0)");
        $clientId = $conn->lastInsertId();
    } else {
        $clientId = $client['id'];
    }

    // Update existing bills that have no due_date
    // $conn->exec("UPDATE bills SET due_date = bill_date + INTERVAL '10 days' WHERE due_date IS NULL AND payment_method = 'Credit'");
    
    // Insert a fresh overdue bill for testing
    $sql = "INSERT INTO bills (bill_type, client_id, bill_number, total_amount, paid_amount, status, payment_method, bill_date, due_date)
            VALUES ('sale', :client_id, 'BILL-OD-001', 15000, 2000, 'Pending', 'Credit', CURRENT_DATE - INTERVAL '40 days', CURRENT_DATE - INTERVAL '10 days')";
    $stmt = $conn->prepare($sql);
    $stmt->execute([':client_id' => $clientId]);
    
    $sql = "INSERT INTO bills (bill_type, client_id, bill_number, total_amount, paid_amount, status, payment_method, bill_date, due_date)
            VALUES ('sale', :client_id, 'BILL-OD-002', 2500, 0, 'Pending', 'Credit', CURRENT_DATE - INTERVAL '60 days', CURRENT_DATE - INTERVAL '30 days')";
    $stmt = $conn->prepare($sql);
    $stmt->execute([':client_id' => $clientId]);
    
    // Update client balance just in case
    $conn->exec("UPDATE clients SET outstanding_balance = (SELECT COALESCE(SUM(total_amount - paid_amount), 0) FROM bills WHERE client_id = clients.id AND payment_method='Credit')");

    echo "Sample overdue data created successfully.";

} catch (Exception $e) {
    echo "Error: " . $e->getMessage();
}
