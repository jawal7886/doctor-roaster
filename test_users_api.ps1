# First, let's login to get a token
$loginBody = @{
    email = "ajmanrecovery529@gmail.com"
    password = "password123"
} | ConvertTo-Json

Write-Host "Logging in..."
try {
    $loginResponse = Invoke-WebRequest -Uri 'http://localhost:8000/api/login' `
        -Method POST `
        -Body $loginBody `
        -ContentType 'application/json'
    
    $loginData = $loginResponse.Content | ConvertFrom-Json
    $token = $loginData.data.token
    Write-Host "Login successful! Token: $($token.Substring(0, 20))..."
    
    # Now test the users endpoint
    Write-Host "`nFetching users..."
    $usersResponse = Invoke-WebRequest -Uri 'http://localhost:8000/api/users' `
        -Method GET `
        -Headers @{
            "Authorization" = "Bearer $token"
            "Accept" = "application/json"
        }
    
    Write-Host "Users API Response:"
    $usersData = $usersResponse.Content | ConvertFrom-Json
    Write-Host "Success: $($usersData.success)"
    Write-Host "Number of users: $($usersData.data.Count)"
    Write-Host "`nFirst few users:"
    $usersData.data | Select-Object -First 3 | FormatTable id, name, email, role, status
    
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    if ($_.ErrorDetails.Message) {
        Write-Host "Details: $($_.ErrorDetails.Message)"
    }
}
