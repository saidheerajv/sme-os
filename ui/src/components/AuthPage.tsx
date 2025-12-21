import React from 'react';
import AuthCard from './AuthCard';

const AuthPage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <AuthCard />
    </div>
  );
};

export default AuthPage;