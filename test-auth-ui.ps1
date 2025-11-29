# CMS Authentication Test Script (PowerShell)
# This script helps test the complete authentication flow

Write-Host "🚀 CMS Authentication Test Script" -ForegroundColor Cyan
Write-Host "==================================" -ForegroundColor Cyan

# Check if backend is running
Write-Host "1. Checking backend status..." -ForegroundColor Yellow
try {
    $response = Invoke-RestMethod -Uri "http://localhost:3000/api/" -Method Get -TimeoutSec 5
    Write-Host "✅ Backend is running on http://localhost:3000" -ForegroundColor Green
} catch {
    Write-Host "❌ Backend is not running. Please start it first:" -ForegroundColor Red
    Write-Host "   cd backend && npm run start:dev" -ForegroundColor Yellow
    exit 1
}

# Test signup
Write-Host ""
Write-Host "2. Testing signup endpoint..." -ForegroundColor Yellow
$signupBody = @{
    email = "test@example.com"
    password = "password123"
    name = "Test User"
} | ConvertTo-Json

try {
    $signupResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/signup" -Method Post -Body $signupBody -ContentType "application/json"
    if ($signupResponse.accessToken) {
        Write-Host "✅ Signup endpoint working" -ForegroundColor Green
        $token = $signupResponse.accessToken
    }
} catch {
    Write-Host "❌ Signup failed or user already exists" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Message)" -ForegroundColor Red
    
    # Try login instead
    Write-Host ""
    Write-Host "3. Testing login endpoint..." -ForegroundColor Yellow
    $loginBody = @{
        email = "test@example.com"
        password = "password123"
    } | ConvertTo-Json
    
    try {
        $loginResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/auth/login" -Method Post -Body $loginBody -ContentType "application/json"
        if ($loginResponse.accessToken) {
            Write-Host "✅ Login endpoint working" -ForegroundColor Green
            $token = $loginResponse.accessToken
        }
    } catch {
        Write-Host "❌ Login failed" -ForegroundColor Red
        Write-Host "Response: $($_.Exception.Message)" -ForegroundColor Red
        exit 1
    }
}

# Test protected route
Write-Host ""
Write-Host "4. Testing protected route..." -ForegroundColor Yellow
$headers = @{
    "Authorization" = "Bearer $token"
}

try {
    $protectedResponse = Invoke-RestMethod -Uri "http://localhost:3000/api/entity-definitions" -Method Get -Headers $headers
    Write-Host "✅ Protected route working" -ForegroundColor Green
} catch {
    Write-Host "❌ Protected route failed" -ForegroundColor Red
    Write-Host "Response: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "🎉 Backend authentication is working!" -ForegroundColor Green
Write-Host ""
Write-Host "Now test the UI:" -ForegroundColor Cyan
Write-Host "1. cd ui && npm run dev" -ForegroundColor Yellow
Write-Host "2. Open http://localhost:5173" -ForegroundColor Yellow
Write-Host "3. Try signup/login with: test@example.com / password123" -ForegroundColor Yellow