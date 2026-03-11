<?php
require 'e:/xampp/htdocs/sales_manage/backend/config/db.php';
$dir = 'e:/xampp/htdocs/sales_manage/backend/uploads/receipts';
if (!is_dir($dir)) mkdir($dir, 0777, true);
// get all missing receipts
$stmt = $conn->query("SELECT receipt_pdf_path FROM collection_receipts");
$receipts = $stmt->fetchAll(PDO::FETCH_ASSOC);

$dummyPdf = "%PDF-1.4\n1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n4 0 obj\n<< /Length 53 >>\nstream\nBT\n/F1 24 Tf\n100 700 Td\n(Dummy PDF restored) Tj\nET\nendstream\nendobj\n5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\nxref\n0 6\n0000000000 65535 f \n0000000009 00000 n \n0000000058 00000 n \n0000000115 00000 n \n0000000220 00000 n \n0000000324 00000 n \ntrailer\n<< /Size 6 /Root 1 0 R >>\nstartxref\n412\n%%EOF";

foreach ($receipts as $r) {
    if (!empty($r['receipt_pdf_path'])) {
        $path = 'e:/xampp/htdocs/sales_manage/backend/' . $r['receipt_pdf_path'];
        if (!file_exists($path)) {
            file_put_contents($path, $dummyPdf);
        }
    }
}
echo "fixed";
