<?php
require 'config/db.php';

try {
    // 1. Alter Users Table to add missing columns from "employees" description
    $conn->exec("ALTER TABLE users Add COLUMN IF NOT EXISTS department VARCHAR(255) DEFAULT 'General'");
    $conn->exec("ALTER TABLE users Add COLUMN IF NOT EXISTS joining_date DATE");
    
    // 2. Create Attendance Table
    $conn->exec("
        CREATE TABLE IF NOT EXISTS attendance (
            id SERIAL PRIMARY KEY,
            employee_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
            attendance_date DATE NOT NULL,
            status VARCHAR(50) NOT NULL CHECK (status IN ('present', 'absent', 'holiday')),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (employee_id, attendance_date)
        )
    ");

    // 3. Create Salary Settings Table
    $conn->exec("
        CREATE TABLE IF NOT EXISTS salary_settings (
            id SERIAL PRIMARY KEY,
            employee_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
            monthly_salary NUMERIC(10,2) DEFAULT 0,
            working_days INTEGER DEFAULT 26,
            holiday_policy VARCHAR(100) DEFAULT 'paid',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ");

    // 4. Create Holidays Table
    $conn->exec("
        CREATE TABLE IF NOT EXISTS holidays (
            id SERIAL PRIMARY KEY,
            holiday_name VARCHAR(255) NOT NULL,
            holiday_date DATE UNIQUE NOT NULL,
            holiday_type VARCHAR(100) DEFAULT 'Public',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ");

    echo "Database setup completed successfully for Attendance and Salary Management.\\n";
} catch(PDOException $e) {
    echo "Error setting up database: " . $e->getMessage() . "\\n";
}
?>
