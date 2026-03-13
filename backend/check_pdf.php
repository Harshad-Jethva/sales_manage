<?php
$file = 'e:\xampp\htdocs\sales_manage\backend\uploads\routes\RoutePlan_abhishek_2026-03-13_7.pdf';
if (file_exists($file)) {
    $content = file_get_contents($file);
    echo "Filesize: " . strlen($content) . "\n";
    echo "First 10 characters: " . bin2hex(substr($content, 0, 10)) . "\n";
    echo "Plain text head: " . substr($content, 0, 10) . "\n";
} else {
    echo "File not found\n";
}
?>
