<?php
require_once 'backend/config/db.php';

try {
    $conn->beginTransaction();

    // 1. Update products table
    $productsColumnsToAdd = [
        'mfg_date' => 'DATE',
        'expiry_date' => 'DATE',
        'default_fetch_quantity' => 'NUMERIC(15,2) DEFAULT 1.00'
    ];

    foreach ($productsColumnsToAdd as $column => $definition) {
        $checkCol = $conn->prepare("SELECT column_name FROM information_schema.columns WHERE table_name = 'products' AND column_name = ?");
        $checkCol->execute([$column]);
        if (!$checkCol->fetch()) {
            $conn->exec("ALTER TABLE products ADD COLUMN $column $definition");
            echo "Added column $column to products table.\n";
        }
    }

    // 2. Update bill_items table
    $billItemsColumnsToAdd = [
        'mfg_date' => 'DATE',
        'expiry_date' => 'DATE',
        'default_fetch_quantity' => 'NUMERIC(15,2) DEFAULT 1.00'
    ];

    foreach ($billItemsColumnsToAdd as $column => $definition) {
        $checkCol = $conn->prepare("SELECT column_name FROM information_schema.columns WHERE table_name = 'bill_items' AND column_name = ?");
        $checkCol->execute([$column]);
        if (!$checkCol->fetch()) {
            $conn->exec("ALTER TABLE bill_items ADD COLUMN $column $definition");
            echo "Added column $column to bill_items table.\n";
        }
    }

    // 3. Ensure indexing for expiry tracking
    try {
        $conn->exec("CREATE INDEX idx_products_expiry_date ON products(expiry_date)");
        $conn->exec("CREATE INDEX idx_bill_items_expiry_date ON bill_items(expiry_date)");
        echo "Created indexes for expiry tracking.\n";
    } catch (Exception $e) {
        echo "Indexes might already exist: " . $e->getMessage() . "\n";
    }

    $conn->commit();
    echo "Migration completed successfully.\n";
} catch (Exception $e) {
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }
    echo "Migration failed: " . $e->getMessage() . "\n";
}
?>
