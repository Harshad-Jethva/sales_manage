<?php
require_once 'config/db.php';
try {
    // Let's recalculate and fix all outstanding balances from bills
    // Just for the user who seems to have an issue (ID 5: jay patel)
    
    // First, verify what bills exist
    $bills = $conn->query("SELECT id, bill_number, total_amount, paid_amount FROM bills WHERE client_id = 5")->fetchAll(PDO::FETCH_ASSOC);
    print_r($bills);
    
    // Total total_amount
    $total_amount_sum = 0;
    $paid_amount_sum = 0;
    foreach($bills as $b) {
        $total_amount_sum += $b['total_amount'];
        $paid_amount_sum += $b['paid_amount'];
    }
    
    $outstanding = $total_amount_sum - $paid_amount_sum;
    echo "Calculated Outstanding: $outstanding\n";
    
    // Update client explicitly
    $conn->prepare("UPDATE clients SET outstanding_balance = ? WHERE id = 5")->execute([$outstanding]);
    echo "Updated client 5 outstanding_balance to $outstanding\n";
    
    $client = $conn->query("SELECT id, name, outstanding_balance FROM clients WHERE id = 5")->fetch(PDO::FETCH_ASSOC);
    print_r($client);
    
} catch (Exception $e) {
    echo $e->getMessage();
}
