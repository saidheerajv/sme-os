# PowerShell test script for authentication system
$BASE_URL = "http://localhost:3000"

Write-Host "🚀 Testing CMS Authentication System" -ForegroundColor Green
Write-Host "=================================="

# Test 1: Signup
Write-Host "`n📝 Testing user signup..." -ForegroundColor Yellow
$signupBody = @{
    email = "testuser@example.com"
    password = "password123"
    name = "Test User"
} | ConvertTo-Json

try {
    $signupResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/signup" -Method POST -Body $signupBody -ContentType "application/json"
    Write-Host "✅ Signup successful" -ForegroundColor Green
    Write-Host "User ID: $($signupResponse.user.id)"
    Write-Host "Email: $($signupResponse.user.email)"
    $token = $signupResponse.accessToken
} catch {
    Write-Host "❌ Signup failed: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        $errorContent = $reader.ReadToEnd()
        Write-Host "Error details: $errorContent" -ForegroundColor Red
    }
    exit 1
}

# Test 2: Login
Write-Host "`n🔐 Testing user login..." -ForegroundColor Yellow
$loginBody = @{
    email = "testuser@example.com"
    password = "password123"
} | ConvertTo-Json

try {
    $loginResponse = Invoke-RestMethod -Uri "$BASE_URL/auth/login" -Method POST -Body $loginBody -ContentType "application/json"
    Write-Host "✅ Login successful" -ForegroundColor Green
    Write-Host "User ID: $($loginResponse.user.id)"
    $token = $loginResponse.accessToken
} catch {
    Write-Host "❌ Login failed: $_" -ForegroundColor Red
    exit 1
}

# Test 3: Access protected route with valid token
Write-Host "`n🛡️  Testing protected route with valid token..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
}

try {
    $protectedResponse = Invoke-RestMethod -Uri "$BASE_URL/entity-definitions" -Method GET -Headers $headers
    Write-Host "✅ Protected route accessible with token" -ForegroundColor Green
    Write-Host "Response: $($protectedResponse | ConvertTo-Json)"
} catch {
    Write-Host "❌ Protected route access failed: $_" -ForegroundColor Red
}

# Test 4: Access protected route without token (should fail)
Write-Host "`n⛔ Testing protected route without token (should fail)..." -ForegroundColor Yellow
try {
    $unauthResponse = Invoke-RestMethod -Uri "$BASE_URL/entity-definitions" -Method GET
    Write-Host "❌ Unexpected: Route should have been protected!" -ForegroundColor Red
} catch {
    Write-Host "✅ Protected route correctly rejected unauthorized access" -ForegroundColor Green
}

# Test 5: Create an entity definition
Write-Host "`n📊 Testing entity definition creation..." -ForegroundColor Yellow
$entityDefBody = @{
    name = "Product"
    fields = @(
        @{
            name = "title"
            type = "string"
            required = $true
        },
        @{
            name = "price"
            type = "number"
            required = $true
        }
    )
} | ConvertTo-Json -Depth 3

try {
    $entityDefResponse = Invoke-RestMethod -Uri "$BASE_URL/entity-definitions" -Method POST -Body $entityDefBody -ContentType "application/json" -Headers $headers
    Write-Host "✅ Entity definition created successfully" -ForegroundColor Green
    Write-Host "Entity Name: $($entityDefResponse.name)"
    Write-Host "Entity ID: $($entityDefResponse.id)"
} catch {
    Write-Host "❌ Entity definition creation failed: $_" -ForegroundColor Red
    if ($_.Exception.Response) {
        $errorResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($errorResponse)
        $errorContent = $reader.ReadToEnd()
        Write-Host "Error details: $errorContent" -ForegroundColor Red
    }
}

Write-Host "`n✨ Authentication testing complete!" -ForegroundColor Green
Write-Host "=================================="