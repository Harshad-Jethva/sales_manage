<?php
require_once 'backend/config/db.php';

try {
    $conn->beginTransaction();

    // 1. Create notifications table if it doesn't exist
    // Based on previous conversations and backend/api/notifications.php, 
    // it likely needs: id, title, message, type, source, attachment_path, sender_id, created_at
    $createNotifications = "
    CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        type VARCHAR(50) DEFAULT 'info',
        source VARCHAR(50) DEFAULT 'system',
        attachment_path VARCHAR(255),
        sender_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );";
    $conn->exec($createNotifications);
    echo "Ensured notifications table exists.\n";

    // 2. Create notification_recipients table if it doesn't exist
    $createRecipients = "
    CREATE TABLE IF NOT EXISTS notification_recipients (
        id SERIAL PRIMARY KEY,
        notification_id INTEGER NOT NULL REFERENCES notifications(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        is_read BOOLEAN DEFAULT FALSE,
        read_at TIMESTAMP,
        status VARCHAR(20) DEFAULT 'pending',
        response_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );";
    $conn->exec($createRecipients);
    echo "Ensured notification_recipients table exists.\n";

    // 3. Check for 'type' and 'source' columns specifically if the table already existed but was missing them
    $columnsToCheck = [
        'type' => "VARCHAR(50) DEFAULT 'info'",
        'source' => "VARCHAR(50) DEFAULT 'system'"
    ];

    foreach ($columnsToCheck as $col => $def) {
        $check = $conn->prepare("SELECT column_name FROM information_schema.columns WHERE table_name = 'notifications' AND column_name = ?");
        $check->execute([$col]);
        if (!$check->fetch()) {
            $conn->exec("ALTER TABLE notifications ADD COLUMN $col $def");
            echo "Added column $col to notifications table.\n";
        }
    }

    $conn->commit();
    echo "Notification schema migration completed successfully.\n";
} catch (Exception $e) {
    if ($conn->inTransaction()) {
        $conn->rollBack();
    }
    echo "Migration failed: " . $e->getMessage() . "\n";
}
