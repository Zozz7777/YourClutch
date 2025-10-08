# Test login endpoint
$body = @{
    emailOrPhone = "test@example.com"
    password = "test123"
} | ConvertTo-Json

Write-Host "Testing login endpoint..."
Write-Host "Body: $body"

try {
    $response = Invoke-RestMethod -Uri "https://clutch-main-nk7x.onrender.com/api/v1/partner-auth/auth/partner-login" -Method POST -ContentType "application/json" -Body $body
    Write-Host "Response: $($response | ConvertTo-Json -Depth 3)"
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "Response: $($_.Exception.Response)"
}
