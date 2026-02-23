# Login as a staff user
$loginBody = @{
    email = "sajawalnazir147@gmail.com"
    password = "password"
} | ConvertTo-Json

Write-Host "Logging in as staff user..."
try {
    $loginResponse = Invoke-WebRequest -Uri 'http://localhost:8000/api/login' `
        -Method POST `
        -Body $loginBody `
        -ContentType 'application/json'
    
    $loginData = $loginResponse.Content | ConvertFrom-Json
    $token = $loginData.data.token
    $userType = $loginData.data.user.user_type
    Write-Host "Login successful!"
    Write-Host "User type: $userType"
    Write-Host "Token: $($token.Substring(0, 20))..."
    
    # Now test the users endpoint
    Write-Host "`nFetching users..."
    $usersResponse = Invoke-WebRequest -Uri 'http://localhost:8000/api/users' `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $token"
            "Accept" = "application/json"
        }
    
    Write-Host "`nUsers API Response:"
    $usersData = $usersResponse.Content | ConvertFrom-Json
    Write-Host "Success: $($usersData.success)"
    Write-Host "Number of users: $($usersData.data.Count)"
    Write-Host "`nFirst 5 users:"
    $usersData.data | Select-Object -First 5 | Format-Table id, name, email, role, status -AutoSize
    
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)"
    }
}
