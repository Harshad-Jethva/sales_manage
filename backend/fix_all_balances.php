<?php
require_once 'config/db.php';
try {
    // Let's create a script to fix all clients' outstanding balances based on their bills
    // Just in case other clients also have missing numbers
    
    $clients = $conn->query("SELECT id FROM clients")->fetchAll(PDO::FETCH_ASSOC);
    
    foreach ($clients as $client) {
        $c_id = $client['id'];
        
        // Sum of all unpaid parts of bills
        $stmt = $conn->prepare("SELECT COALESCE(SUM(total_amount - paid_amount), 0) AS out_bal FROM bills WHERE client_id = ? AND total_amount > paid_amount");
        $stmt->execute([$c_id]);
        $res = $stmt->fetch(PDO::FETCH_ASSOC);
        
        $new_bal = $res['out_bal'] ?: 0;
        
        $update = $conn->prepare("UPDATE clients SET outstanding_balance = ? WHERE id = ?");
        $update->execute([$new_bal, $c_id]);
    }
    
    echo "Successfully recalculated and fixed outstanding_balances for all clients based on active bills.\n";
    
} catch (Exception $e) {
    echo $e->getMessage();
}
