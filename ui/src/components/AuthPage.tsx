
import React, { useState } from 'react';
import { Card, Button, Spinner, Alert, TextInput, Label } from 'flowbite-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

// ...existing code...

const AuthPage: React.FC = () => {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ email: '', password: '', name: '' });
  const { login, signup, isLoading, error } = useAuth();
  const navigate = useNavigate();

  const handleTabChange = (tabKey: 'login' | 'signup') => {
    setTab(tabKey);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(loginData.email, loginData.password);
      navigate('/dashboard');
    } catch (err) {
      // Error is handled by the auth context
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await signup(signupData.email, signupData.password, signupData.name);
      navigate('/dashboard');
    } catch (err) {
      // Error is handled by the auth context
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md p-6">
        <div className="flex mb-4 border-b">
          <button
            className={`flex-1 py-2 text-center font-semibold ${tab === 'login' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
            onClick={() => handleTabChange('login')}
            type="button"
          >
            Login
          </button>
          <button
            className={`flex-1 py-2 text-center font-semibold ${tab === 'signup' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
            onClick={() => handleTabChange('signup')}
            type="button"
          >
            Sign Up
          </button>
        </div>

        {error && (
          <Alert color="failure" className="mb-4">
            {error}
          </Alert>
        )}

        {tab === 'login' && (
          <div>
            <h1 className="text-2xl font-bold text-center mb-2">Welcome Back</h1>
            <p className="text-center text-gray-500 mb-4">Sign in to your account</p>
            <form className="space-y-4" onSubmit={handleLogin}>
              <div>
                <Label htmlFor="login-email">Email Address</Label>
                <TextInput
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  autoFocus
                  value={loginData.email}
                  onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="login-password">Password</Label>
                <TextInput
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="mt-1"
                />
              </div>
              <Button type="submit" color="blue" className="w-full" disabled={isLoading}>
                {isLoading ? <Spinner size="sm" /> : 'Sign In'}
              </Button>
            </form>
          </div>
        )}

        {tab === 'signup' && (
          <div>
            <h1 className="text-2xl font-bold text-center mb-2">Create Account</h1>
            <p className="text-center text-gray-500 mb-4">Join our CMS platform</p>
            <form className="space-y-4" onSubmit={handleSignup}>
              <div>
                <Label htmlFor="signup-name">Full Name</Label>
                <TextInput
                  id="signup-name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  autoFocus
                  value={signupData.name}
                  onChange={(e) => setSignupData({ ...signupData, name: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="signup-email">Email Address</Label>
                <TextInput
                  id="signup-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={signupData.email}
                  onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="signup-password">Password</Label>
                <TextInput
                  id="signup-password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  className="mt-1"
                />
              </div>
              <Button type="submit" color="blue" className="w-full" disabled={isLoading}>
                {isLoading ? <Spinner size="sm" /> : 'Sign Up'}
              </Button>
            </form>
          </div>
        )}
      </Card>
    </div>
  );
};

export default AuthPage;