import React, { useState } from 'react';
import { Card, Spinner, Alert, TextInput, Label, Button } from 'flowbite-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const AuthCard: React.FC = () => {
  const [tab, setTab] = useState<'login' | 'signup'>('login');
  const [loginData, setLoginData] = useState({ email: '', password: '' });
  const [signupData, setSignupData] = useState({ email: '', password: '', name: '', organizationName: '' });
  const { login, signup, isLoading, error } = useAuth();
  const navigate = useNavigate();

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
      await signup(signupData.email, signupData.password, signupData.name, signupData.organizationName);
      navigate('/dashboard');
    } catch (err) {
      // Error is handled by the auth context
    }
  };

  return (
    <Card className="w-full max-w-md p-6">
      {/* Sliding Tab Selector */}
      <div className="relative mb-6">
        <div className="flex bg-gray-100 rounded-xl p-1">
          {/* Sliding background indicator */}
          <div
            className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-white rounded-lg shadow-md transition-all duration-300 ease-out ${
              tab === 'signup' ? 'translate-x-[calc(100%+4px)]' : 'translate-x-0'
            }`}
          />
          
          {/* Login Tab */}
          <button
            onClick={() => setTab('login')}
            className={`relative z-10 flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-300 ${
              tab === 'login'
                ? 'text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            type="button"
          >
            Sign In
          </button>
          
          {/* Signup Tab */}
          <button
            onClick={() => setTab('signup')}
            className={`relative z-10 flex-1 py-2.5 text-sm font-semibold rounded-lg transition-colors duration-300 ${
              tab === 'signup'
                ? 'text-primary-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            type="button"
          >
            Sign Up
          </button>
        </div>
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
            <Button type="submit" className="w-full cursor-pointer" disabled={isLoading}>
              {isLoading ? <Spinner size="sm" /> : 'Sign In'}
            </Button>
          </form>
        </div>
      )}

      {tab === 'signup' && (
        <div>
          <h1 className="text-2xl font-bold text-center mb-2">Create Account</h1>
          <p className="text-center text-gray-500 mb-4">Join our platform</p>
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
              <Label htmlFor="signup-organization">Business Name</Label>
              <TextInput
                id="signup-organization"
                name="organizationName"
                type="text"
                placeholder="Your Company Name"
                required
                value={signupData.organizationName}
                onChange={(e) => setSignupData({ ...signupData, organizationName: e.target.value })}
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
            <Button type="submit" color="primary" className="w-full cursor-pointer" disabled={isLoading}>
              {isLoading ? <Spinner size="sm" /> : 'Sign Up'}
            </Button>
          </form>
        </div>
      )}
    </Card>
  );
};

export default AuthCard;
