# Authentication Implementation

This CMS platform now includes JWT-based authentication with email/password login. Here's what has been implemented:

## Features

### 1. User Authentication
- **Signup**: Create new user accounts with email, password, and name
- **Login**: Authenticate users with email and password
- **JWT Tokens**: Secure token-based authentication with 24-hour expiration
- **Password Security**: Passwords are hashed using bcrypt with salt rounds

### 2. Protected Routes
All entity management APIs are now protected and require authentication:
- Entity Definition APIs: `/entity-definitions/*`
- Dynamic Entity APIs: `/entities/:entityType/*`

### 3. User Context
Authenticated endpoints automatically receive the current user context, ensuring data isolation between users.

## API Endpoints

### Authentication Routes

#### POST /auth/signup
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "John Doe"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2023-10-17T12:00:00Z",
    "updatedAt": "2023-10-17T12:00:00Z"
  },
  "accessToken": "jwt-token-here"
}
```

#### POST /auth/login
Authenticate an existing user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "createdAt": "2023-10-17T12:00:00Z",
    "updatedAt": "2023-10-17T12:00:00Z"
  },
  "accessToken": "jwt-token-here"
}
```

### Protected Routes

All protected routes require the `Authorization` header:
```
Authorization: Bearer <your-jwt-token>
```

#### Entity Definition APIs
- `POST /entity-definitions` - Create new entity definition
- `GET /entity-definitions` - List user's entity definitions
- `GET /entity-definitions/:name` - Get specific entity definition
- `DELETE /entity-definitions/:name` - Delete entity definition

#### Dynamic Entity APIs
- `POST /entities/:entityType` - Create new entity instance
- `GET /entities/:entityType` - List entities of a type
- `GET /entities/:entityType/:id` - Get specific entity
- `PUT /entities/:entityType/:id` - Update entity
- `DELETE /entities/:entityType/:id` - Delete entity

## Database Schema

The User model includes:
```prisma
model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String   // Hashed with bcrypt
  name      String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  entityDefinitions EntityDefinition[]
  dynamicEntities   DynamicEntity[]
}
```

## Environment Variables

Make sure to set these environment variables:

```env
# Database
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/nestdb"

# JWT Secret (change this in production!)
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
```

## Security Features

1. **Password Hashing**: All passwords are hashed using bcrypt with 10 salt rounds
2. **JWT Expiration**: Tokens expire after 24 hours
3. **User Isolation**: All APIs are scoped to the authenticated user
4. **Input Validation**: Request bodies are validated using class-validator
5. **Error Handling**: Proper error responses for authentication failures

## Testing the Authentication

### 1. Start the Database
```bash
docker-compose up -d
```

### 2. Run Migrations
```bash
npx prisma migrate dev
```

### 3. Start the Application
```bash
npm run start:dev
```

### 4. Test Signup
```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123",
    "name": "Test User"
  }'
```

### 5. Test Login
```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

### 6. Test Protected Route
```bash
# Use the token from login response
curl -X GET http://localhost:3000/entity-definitions \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

## Implementation Details

The authentication system uses:
- **@nestjs/jwt** for JWT token management
- **@nestjs/passport** with **passport-jwt** strategy
- **bcrypt** for password hashing
- **class-validator** for input validation
- Custom guards and decorators for route protection

All user data is automatically scoped to the authenticated user, ensuring complete data isolation between different users of the CMS platform.