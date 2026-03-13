param(
    [string]$BaseUrl = "http://localhost/sales_manage/backend/api",
    [string]$Username = "admin",
    [string]$Password = "admin123"
)

$ErrorActionPreference = "Stop"

function Invoke-Api {
    param(
        [string]$Name,
        [string]$Uri,
        [string]$Method = "GET",
        $Body = $null,
        [hashtable]$Headers = @{}
    )

    try {
        if ($Method -in @("GET", "DELETE")) {
            $res = Invoke-RestMethod -Uri $Uri -Method $Method -Headers $Headers -TimeoutSec 20
        } else {
            $jsonBody = if ($Body -is [string]) { $Body } else { ($Body | ConvertTo-Json -Depth 10) }
            $res = Invoke-RestMethod -Uri $Uri -Method $Method -Headers $Headers -Body $jsonBody -ContentType "application/json" -TimeoutSec 20
        }

        return [PSCustomObject]@{
            Name    = $Name
            Passed  = [bool]$res.success
            Success = $res.success
            Message = $res.message
        }
    } catch {
        $details = $_.ErrorDetails.Message
        if (-not $details) {
            $details = $_.Exception.Message
        }

        return [PSCustomObject]@{
            Name    = $Name
            Passed  = $false
            Success = $false
            Message = $details
        }
    }
}

$results = @()

$login = Invoke-Api -Name "auth.login" -Uri "$BaseUrl/login.php" -Method "POST" -Body @{ username = $Username; password = $Password }
$results += $login

if (-not $login.Passed) {
    $results | Format-Table -AutoSize
    Write-Error "Login failed. Stopping smoke test."
    exit 1
}

$tokenResponse = Invoke-RestMethod -Uri "$BaseUrl/login.php" -Method "POST" -Body (@{ username = $Username; password = $Password } | ConvertTo-Json) -ContentType "application/json" -TimeoutSec 20
$token = $tokenResponse.token
$headers = @{ Authorization = "Bearer $token" }

$results += Invoke-Api -Name "auth.verify" -Uri "$BaseUrl/verify_auth.php" -Method "POST" -Body @{ token = $token } -Headers $headers
$results += Invoke-Api -Name "users.list" -Uri "$BaseUrl/users.php" -Method "GET" -Headers $headers
$results += Invoke-Api -Name "banks.list" -Uri "$BaseUrl/banks.php" -Method "GET" -Headers $headers
$results += Invoke-Api -Name "route.areas" -Uri "$BaseUrl/route_planner.php?action=get_areas" -Method "GET" -Headers $headers
$results += Invoke-Api -Name "cash.expected" -Uri "$BaseUrl/cash_handover.php?action=get_expected&date=$(Get-Date -Format yyyy-MM-dd)" -Method "GET" -Headers $headers
$results += Invoke-Api -Name "notifications.list" -Uri "$BaseUrl/notifications.php?action=list" -Method "GET" -Headers $headers
$results += Invoke-Api -Name "monitor.client_error" -Uri "$BaseUrl/error_monitor.php" -Method "POST" -Body @{ type = "smoke_test"; message = "smoke test event"; url = "smoke://test" } -Headers $headers
$results += Invoke-Api -Name "auth.logout" -Uri "$BaseUrl/logout.php" -Method "POST" -Body @{ token = $token } -Headers $headers

$results | Format-Table -AutoSize

if (($results | Where-Object { -not $_.Passed }).Count -gt 0) {
    exit 1
}
