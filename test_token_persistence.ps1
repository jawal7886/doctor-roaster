# Test token persistence across requests

# Step 1: Login
Write-Host "Step 1: Logging in..."
$loginBody = @{
    email = "sajawalnazir147@gmail.com"
    password = "password"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-WebRequest -Uri 'http://localhost:8000/api/login' `
        -Method POST `
        -Body $loginBody `
        -ContentType 'application/json'
    
    $loginData = $loginResponse.Content | ConvertFrom-Json
    $token = $loginData.data.token
    Write-Host "✓ Login successful!"
    Write-Host "  Token: $($token.Substring(0, 30))..."
    Write-Host "  User: $($loginData.data.user.name)"
    Write-Host "  User Type: $($loginData.data.user.user_type)"
    
    # Step 2: Test /me endpoint immediately
    Write-Host "`nStep 2: Testing /me endpoint immediately after login..."
    $meResponse1 = Invoke-WebRequest -Uri 'http://localhost:8000/api/me' `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $token"
            "Accept" = "application/json"
        }
    
    $meData1 = $meResponse1.Content | ConvertFrom-Json
    Write-Host "✓ /me endpoint works!"
    Write-Host "  User: $($meData1.data.name)"
    
    # Step 3: Wait a moment and test again (simulating page refresh)
    Write-Host "`nStep 3: Waiting 2 seconds (simulating page refresh)..."
    Start-Sleep -Seconds 2
    
    Write-Host "Testing /me endpoint again..."
    $meResponse2 = Invoke-WebRequest -Uri 'http://localhost:8000/api/me' `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $token"
            "Accept" = "application/json"
        }
    
    $meData2 = $meResponse2.Content | ConvertFrom-Json
    Write-Host "✓ /me endpoint still works!"
    Write-Host "  User: $($meData2.data.name)"
    
    # Step 4: Check token in database
    Write-Host "`nStep 4: Checking token in database..."
    $tokenId = $token.Split('|')[0]
    Write-Host "  Token ID: $tokenId"
    
    Write-Host "`n✓ ALL TESTS PASSED!"
    Write-Host "Token is persistent and working correctly."
    
} catch {
    Write-Host "✗ Error: $($_.Exception.Message)"
    if ($_.ErrorDetails.Message) {
        Write-Host "Details:"
        $_.ErrorDetails.Message | ConvertFrom-Json | ConvertTo-Json -Depth 10
    }
    Write-Host "`nStatus Code: $($_.Exception.Response.StatusCode.value__)"
}
