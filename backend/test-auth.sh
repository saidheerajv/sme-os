#!/bin/bash

# Test script for authentication system
BASE_URL="http://localhost:3000"

echo "🚀 Testing CMS Authentication System"
echo "=================================="

# Test 1: Signup
echo -e "\n📝 Testing user signup..."
SIGNUP_RESPONSE=$(curl -s -X POST $BASE_URL/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "password123",
    "name": "Test User"
  }')

echo "Signup Response: $SIGNUP_RESPONSE"

# Extract token from signup response
TOKEN=$(echo $SIGNUP_RESPONSE | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

if [ -z "$TOKEN" ]; then
  echo "❌ Signup failed - no token received"
  exit 1
else
  echo "✅ Signup successful - token received"
fi

# Test 2: Login
echo -e "\n🔐 Testing user login..."
LOGIN_RESPONSE=$(curl -s -X POST $BASE_URL/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "testuser@example.com",
    "password": "password123"
  }')

echo "Login Response: $LOGIN_RESPONSE"

# Test 3: Access protected route with valid token
echo -e "\n🛡️  Testing protected route with valid token..."
PROTECTED_RESPONSE=$(curl -s -X GET $BASE_URL/entity-definitions \
  -H "Authorization: Bearer $TOKEN")

echo "Protected Route Response: $PROTECTED_RESPONSE"

# Test 4: Access protected route without token (should fail)
echo -e "\n⛔ Testing protected route without token (should fail)..."
UNAUTH_RESPONSE=$(curl -s -X GET $BASE_URL/entity-definitions)

echo "Unauthorized Response: $UNAUTH_RESPONSE"

# Test 5: Create an entity definition
echo -e "\n📊 Testing entity definition creation..."
ENTITY_DEF_RESPONSE=$(curl -s -X POST $BASE_URL/entity-definitions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Product",
    "fields": [
      {
        "name": "title",
        "type": "string",
        "required": true
      },
      {
        "name": "price",
        "type": "number",
        "required": true
      }
    ]
  }')

echo "Entity Definition Response: $ENTITY_DEF_RESPONSE"

echo -e "\n✨ Authentication testing complete!"
echo "=================================="