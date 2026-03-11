<?php
require_once 'backend/config/db.php';

try {
    $conn->beginTransaction();

    // 1. Update products table
    $columnsToAdd = [
        'min_stock_level' => 'INTEGER DEFAULT 5',
        'supplier_id' => 'INTEGER REFERENCES suppliers(id) ON DELETE SET NULL'
    ];

    foreach ($columnsToAdd as $column => $definition) {
        $checkCol = $conn->prepare("SELECT column_name FROM information_schema.columns WHERE table_name = 'products' AND column_name = ?");
        $checkCol->execute([$column]);
        if (!$checkCol->fetch()) {
            $conn->exec("ALTER TABLE products ADD COLUMN $column $definition");
            echo "Added column $column to products table.\n";
        }
    }

    // 2. Add constraint for non-negative stock
    try {
        $conn->exec("ALTER TABLE products ADD CONSTRAINT check_stock_non_negative CHECK (stock_quantity >= 0)");
        echo "Added non-negative stock constraint.\n";
    } catch (Exception $e) {
        echo "Constraint might already exist: " . $e->getMessage() . "\n";
    }

    // 3. Create stock_history table
    $createStockHistory = "
    CREATE TABLE IF NOT EXISTS stock_history (
        id SERIAL PRIMARY KEY,
        product_id INTEGER NOT NULL REFERENCES products(id) ON DELETE CASCADE,
        change_quantity NUMERIC(15,2) NOT NULL,
        old_quantity NUMERIC(15,2) NOT NULL,
        new_quantity NUMERIC(15,2) NOT NULL,
        type VARCHAR(20) CHECK (type IN ('purchase', 'sale', 'adjustment', 'return')) NOT NULL,
        reference_id INTEGER,
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );";
    $conn->exec($createStockHistory);
    echo "Ensured stock_history table exists.\n";

    $conn->commit();
    echo "Migration completed successfully.\n";
} catch (Exception $e) {
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }
    echo "Migration failed: " . $e->getMessage() . "\n";
}
