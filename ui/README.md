# CMS UI - Authentication Implementation

This React frontend provides a complete authentication interface for the CMS platform with JWT-based authentication.

## Features

### 🔐 Authentication Flow
- **Landing Page**: Clean login/signup forms with Material-UI components
- **JWT Integration**: Automatic token management and API integration
- **Protected Routes**: Dashboard and other protected pages require authentication
- **Persistent Sessions**: Tokens are stored in localStorage for session persistence
- **Automatic Logout**: Logout button clears session and redirects to login

### 🎨 UI Components
- **Material-UI Design System**: Modern, responsive interface
- **Tabbed Authentication**: Switch between login and signup forms
- **Loading States**: Spinner indicators during API calls
- **Error Handling**: User-friendly error messages
- **Dashboard**: Welcome page with user information and CMS features

### 🔄 State Management
- **React Context**: Global authentication state management
- **TypeScript**: Full type safety for authentication data
- **Error Boundaries**: Graceful error handling and recovery

## Project Structure

```
ui/src/
├── components/
│   ├── AuthPage.tsx          # Login/Signup forms
│   ├── Dashboard.tsx         # Protected dashboard page
│   ├── ProtectedRoute.tsx    # Route protection component
│   ├── LoadingScreen.tsx     # Loading indicator
│   └── ErrorBoundary.tsx     # Error handling boundary
├── contexts/
│   └── AuthContext.tsx       # Authentication state management
├── App.tsx                   # Main app with routing
├── App.css                   # Application styles
└── main.tsx                  # React root
```

## Authentication API Integration

The UI integrates with the backend authentication endpoints:

### Signup
- **Endpoint**: `POST /api/auth/signup`
- **Payload**: `{ email, password, name }`
- **Response**: `{ user, accessToken }`

### Login
- **Endpoint**: `POST /api/auth/login`
- **Payload**: `{ email, password }`
- **Response**: `{ user, accessToken }`

### Protected API Calls
All API requests to protected endpoints automatically include:
```
Authorization: Bearer <jwt-token>
```

## Usage

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Access the Application
- Open `http://localhost:5173`
- You'll see the login/signup page
- Create an account or login with existing credentials
- After authentication, you'll be redirected to the dashboard

### 3. Test Authentication Flow
1. **Signup**: Create a new account with email, password, and name
2. **Auto-login**: You'll be automatically logged in after signup
3. **Dashboard**: View the protected dashboard with user information
4. **Logout**: Click the logout button to clear session and return to login
5. **Session Persistence**: Refresh the page - you'll stay logged in
6. **Protected Routes**: Try accessing `/dashboard` without authentication

## Environment Setup

The UI uses Vite proxy configuration to forward API calls to the backend:

```typescript
// vite.config.ts
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true,
    }
  }
}
```

Make sure your backend is running on `http://localhost:3000`.

## Key Components Explained

### AuthContext
Manages global authentication state:
- User information storage
- Login/signup functions
- Token management
- Loading states
- Error handling

### ProtectedRoute
Wraps components that require authentication:
- Checks for valid user session
- Redirects to login if not authenticated
- Shows loading spinner during auth checks

### AuthPage
Combined login/signup interface:
- Tabbed interface for switching between forms
- Form validation and error display
- Material-UI components for consistent design
- Automatic redirect after successful authentication

### Dashboard
Protected dashboard page:
- Displays user information
- Navigation bar with logout
- Placeholder for CMS features
- Responsive Material-UI layout

## Styling

The application uses:
- **Material-UI**: Complete design system with components and theming
- **CssBaseline**: Consistent browser default styles
- **Custom Theme**: Primary and secondary color configuration
- **Responsive Design**: Mobile-first responsive layouts

## Error Handling

Multiple layers of error handling:
- **API Errors**: Displayed in authentication forms
- **Network Errors**: Graceful handling of connection issues
- **React Error Boundaries**: Catch and display unexpected errors
- **Loading States**: User feedback during API operations

## Security Features

- **JWT Token Storage**: Secure token management in localStorage
- **Automatic Token Cleanup**: Tokens removed on logout
- **Route Protection**: Unauthenticated users can't access protected pages
- **API Integration**: All protected API calls include authentication headers

## Next Steps

Future enhancements:
- Add password strength validation
- Implement password reset functionality
- Add user profile management
- Integrate with CMS entity management features
- Add role-based access control
- Implement refresh token rotation
