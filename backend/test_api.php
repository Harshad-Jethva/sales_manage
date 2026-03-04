<?php
$url = 'http://localhost/sales_manage/backend/api/bills.php';
$data = [
    'bill_type' => 'sale',
    'customer_id' => null,
    'bill_number' => 'TEST-' . time(),
    'sub_total' => 100,
    'discount_amount' => 0,
    'tax_amount' => 18,
    'total_amount' => 118,
    'paid_amount' => 118,
    'payment_method' => 'Cash',
    'status' => 'paid',
    'bill_date' => date('Y-m-d'),
    'items' => [
        [
            'product_id' => 1,
            'name' => 'Test Item',
            'qty' => 1,
            'price' => 100,
            'gst_percent' => 18,
            'total' => 100
        ]
    ]
];

$ch = curl_init($url);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

echo "HTTP Code: $httpCode\n";
echo "Response: $response\n";
?>
