<?php
require_once '../config/db.php';
header('Content-Type: application/json');

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents("php://input"), true);

switch($method) {
    case 'GET':
        if(isset($_GET['transactions'])) {
            $sql = "SELECT t.*, a.bank_name, a.account_number FROM bank_transactions t JOIN bank_accounts a ON t.account_id = a.id";
            if(isset($_GET['account_id'])) {
                $account_id = $_GET['account_id'];
                $sql .= " WHERE t.account_id = $account_id";
            }
            $sql .= " ORDER BY t.transaction_date DESC";
            $stmt = $conn->query($sql);
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        } else {
            $stmt = $conn->query("SELECT * FROM bank_accounts ORDER BY bank_name ASC");
            echo json_encode($stmt->fetchAll(PDO::FETCH_ASSOC));
        }
        break;

    case 'POST':
        if(isset($input['action'])) {
            if($input['action'] == 'add_account') {
                $stmt = $conn->prepare("INSERT INTO bank_accounts (bank_name, account_number, account_holder, balance) VALUES (?, ?, ?, ?)");
                if($stmt->execute([$input['bank_name'], $input['account_number'], $input['account_holder'], $input['balance'] ?? 0])) {
                    echo json_encode(["message" => "Account added successfully", "success" => true]);
                } else {
                    echo json_encode(["error" => "Failed to add account", "success" => false]);
                }
            } elseif($input['action'] == 'transaction') {
                $conn->beginTransaction();
                try {
                    $stmt = $conn->prepare("INSERT INTO bank_transactions (account_id, type, amount, description, transaction_date) VALUES (?, ?, ?, ?, ?)");
                    $stmt->execute([$input['account_id'], $input['type'], $input['amount'], $input['description'], $input['date']]);
                    
                    $modifier = ($input['type'] == 'credit') ? "+" : "-";
                    // Only update balance if type is credit or debit. 
                    if ($modifier == '-') {
                        $check = $conn->query("SELECT balance FROM bank_accounts WHERE id = " . $input['account_id'])->fetch();
                        if ($check['balance'] < $input['amount']) {
                            // throw new Exception("Insufficient balance"); // Optional: allow negative?
                        }
                    }

                    $update_stmt = $conn->prepare("UPDATE bank_accounts SET balance = balance $modifier ? WHERE id = ?");
                    $update_stmt->execute([$input['amount'], $input['account_id']]);
                    
                    $conn->commit();
                    echo json_encode(["message" => "Transaction successful", "success" => true]);
                } catch(Exception $e) {
                    $conn->rollBack();
                    echo json_encode(["error" => $e->getMessage(), "success" => false]);
                }
            }
        }
        break;

    case 'PUT':
        if(!isset($input['id'])) {
            echo json_encode(["error" => "ID required", "success" => false]);
            exit;
        }
        $stmt = $conn->prepare("UPDATE bank_accounts SET bank_name=?, account_number=?, account_holder=? WHERE id=?");
        if($stmt->execute([$input['bank_name'], $input['account_number'], $input['account_holder'], $input['id']])) {
             echo json_encode(["message" => "Account updated", "success" => true]);
        } else {
             echo json_encode(["error" => "Update failed", "success" => false]);
        }
        break;

    case 'DELETE':
        $id = '';
        if(isset($_GET['id'])) $id = $_GET['id'];
        elseif(isset($input['id'])) $id = $input['id'];
        
        if($id) {
            $conn->beginTransaction();
            try {
                $conn->exec("DELETE FROM bank_transactions WHERE account_id = $id");
                $stmt = $conn->prepare("DELETE FROM bank_accounts WHERE id = ?");
                $stmt->execute([$id]);
                $conn->commit();
                echo json_encode(["message" => "Account deleted", "success" => true]);
            } catch(Exception $e) {
                $conn->rollBack();
                echo json_encode(["error" => "Delete failed: " + $e->getMessage(), "success" => false]);
            }
        } else {
             echo json_encode(["error" => "ID required", "success" => false]);
        }
        break;
}
?>
