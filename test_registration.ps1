$body = @{
    name = "Test User"
    email = "test@gmail.com"
    password = "password123"
    password_confirmation = "password123"
    phone = "1234567890"
} | ConvertTo-Json

Write-Host "Testing registration endpoint..."
Write-Host "URL: http://localhost:8000/api/register"
Write-Host "Body: $body"
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri 'http://localhost:8000/api/register' `
        -Method POST `
        -Body $body `
        -ContentType 'application/json'
    
    Write-Host "Success! Status Code: $($response.StatusCode)"
    Write-Host "Response:"
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error! Status Code: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "Error Message:"
    $_.Exception.Response | Out-String
    if ($_.ErrorDetails.Message) {
        $_.ErrorDetails.Message | ConvertFrom-Json | ConvertTo-Json -Depth 10
    }
}
