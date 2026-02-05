import React from 'react';
import {
  Button,
  Card,
} from 'flowbite-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { DarkThemeToggle } from "flowbite-react";


const DashboardHome: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="container mx-auto">
      {/* Welcome Card */}
      <Card className="mb-6 bg-teal-500 text-white text-center">
        <h1 className="text-3xl font-bold mb-2">Welcome to Your CMS Dashboard</h1>
        <h2 className="text-xl mb-1">Hello, {user?.name}! You are successfully logged in.</h2>
        <p className="opacity-90">Email: {user?.email}</p>
        <DarkThemeToggle className="mt-4 mx-auto" />
      </Card>

      {/* Feature Cards */}
      <div className="flex flex-wrap gap-4 mb-6">
        <div className="flex-1 min-w-[300px]">
          <Card>
            <h3 className="text-lg font-semibold mb-2">Entity Definitions</h3>
            <p className="text-sm text-gray-500">Create and manage your content entity definitions</p>
            <Button color="light" className="mt-3 w-full" onClick={() => navigate('/dashboard/entity-definitions')}>
              Manage Entities
            </Button>
          </Card>
        </div>
        <div className="flex-1 min-w-[300px]">
          <Card>
            <h3 className="text-lg font-semibold mb-2">Content Management</h3>
            <p className="text-sm text-gray-500">Create, edit, and organize your content</p>
            <Button color="light" className="mt-3 w-full">
              Manage Content
            </Button>
          </Card>
        </div>
        <div className="flex-1 min-w-[300px]">
          <Card>
            <h3 className="text-lg font-semibold mb-2">Settings</h3>
            <p className="text-sm text-gray-500">Configure your account and preferences</p>
            <Button color="light" className="mt-3 w-full">
              View Settings
            </Button>
          </Card>
        </div>
      </div>

      {/* User Info Card */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Account Information</h3>
        <div className="flex flex-wrap gap-8">
          <div className="flex-1 min-w-[200px]">
            <p className="text-sm text-gray-500">User ID</p>
            <p className="text-base">{user?.id}</p>
          </div>
          <div className="flex-1 min-w-[200px]">
            <p className="text-sm text-gray-500">Member Since</p>
            <p className="text-base">{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default DashboardHome;