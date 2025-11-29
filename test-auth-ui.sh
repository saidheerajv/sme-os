#!/bin/bash

# CMS Authentication Test Script
# This script helps test the complete authentication flow

echo "🚀 CMS Authentication Test Script"
echo "=================================="

# Check if backend is running
echo "1. Checking backend status..."
if curl -s -f http://localhost:3000/api/ > /dev/null; then
    echo "✅ Backend is running on http://localhost:3000"
else
    echo "❌ Backend is not running. Please start it first:"
    echo "   cd backend && npm run start:dev"
    exit 1
fi

# Test signup
echo ""
echo "2. Testing signup endpoint..."
SIGNUP_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }')

if echo "$SIGNUP_RESPONSE" | grep -q "accessToken"; then
    echo "✅ Signup endpoint working"
    TOKEN=$(echo "$SIGNUP_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
else
    echo "❌ Signup failed or user already exists"
    echo "Response: $SIGNUP_RESPONSE"
    
    # Try login instead
    echo ""
    echo "3. Testing login endpoint..."
    LOGIN_RESPONSE=$(curl -s -X POST http://localhost:3000/api/auth/login \
      -H "Content-Type: application/json" \
      -d '{
        "email": "test@example.com",
        "password": "password123"
      }')
    
    if echo "$LOGIN_RESPONSE" | grep -q "accessToken"; then
        echo "✅ Login endpoint working"
        TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"accessToken":"[^"]*"' | cut -d'"' -f4)
    else
        echo "❌ Login failed"
        echo "Response: $LOGIN_RESPONSE"
        exit 1
    fi
fi

# Test protected route
echo ""
echo "4. Testing protected route..."
PROTECTED_RESPONSE=$(curl -s -X GET http://localhost:3000/api/entity-definitions \
  -H "Authorization: Bearer $TOKEN")

if echo "$PROTECTED_RESPONSE" | grep -q -v "Unauthorized"; then
    echo "✅ Protected route working"
else
    echo "❌ Protected route failed"
    echo "Response: $PROTECTED_RESPONSE"
fi

echo ""
echo "🎉 Backend authentication is working!"
echo ""
echo "Now test the UI:"
echo "1. cd ui && npm run dev"
echo "2. Open http://localhost:5173"
echo "3. Try signup/login with: test@example.com / password123"