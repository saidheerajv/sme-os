import React from 'react';
import {
  Navbar,
  Button,
  Card,
} from 'flowbite-react';
import { FaSignOutAlt, FaUser, FaTachometerAlt } from 'react-icons/fa';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <Navbar fluid rounded className="bg-linear-to-r from-pink-400 to-orange-400 text-white">
        <a href="#" className="flex items-center">
          <FaTachometerAlt className="mr-2 text-xl" />
          <span className="self-center whitespace-nowrap text-xl font-semibold">CMS Dashboard</span>
        </a>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <FaUser />
            <span className="text-sm">{user?.name}</span>
          </div>
          <Button color="light" onClick={handleLogout} className="flex items-center gap-2">
            <FaSignOutAlt /> Logout
          </Button>
        </div>
      </Navbar>

      {/* Main Content */}
      <div className="container mx-auto mt-8 mb-8">
        {/* Welcome Card */}
        <Card className="mb-6 bg-linear-to-r from-pink-400 to-orange-400 text-white text-center">
          <h1 className="text-3xl font-bold mb-2">Welcome to Your CMS Dashboard</h1>
          <h2 className="text-xl mb-1">Hello, {user?.name}! You are successfully logged in.</h2>
          <p className="opacity-90">Email: {user?.email}</p>
        </Card>

        {/* Feature Cards */}
        <div className="flex flex-wrap gap-4 mb-6">
          <div className="flex-1 min-w-[300px]">
            <Card>
              <h3 className="text-lg font-semibold mb-2">Entity Definitions</h3>
              <p className="text-sm text-gray-500">Create and manage your content entity definitions</p>
              <Button color="light" className="mt-3 w-full" onClick={() => navigate('/entity-definitions')}>
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
    </div>
  );
};

export default Dashboard;