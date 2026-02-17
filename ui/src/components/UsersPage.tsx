import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Alert, Spinner } from 'flowbite-react';
import { FaUserPlus, FaTrash, FaUserShield, FaUser, FaCrown } from 'react-icons/fa';
import { organizationsApi } from '../services/organizations.api';
import CreateUserModal from './CreateUserModal';
import type { OrganizationMember, CreateUserDto } from '../types/organization.types';

interface Props {
  organizationId: string;
}

const UsersPage: React.FC<Props> = ({ organizationId }) => {
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [deletingMemberId, setDeletingMemberId] = useState<string | null>(null);

  useEffect(() => {
    loadMembers();
  }, [organizationId]);

  const loadMembers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await organizationsApi.getMembers(organizationId);
      setMembers(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (data: CreateUserDto) => {
    await organizationsApi.createUser(organizationId, data);
    await loadMembers();
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this user from the organization?')) {
      return;
    }

    try {
      setDeletingMemberId(memberId);
      await organizationsApi.removeMember(organizationId, memberId);
      await loadMembers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to remove user');
    } finally {
      setDeletingMemberId(null);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'owner':
        return <FaCrown className="text-yellow-500" />;
      case 'admin':
        return <FaUserShield className="text-primary-600" />;
      default:
        return <FaUser className="text-gray-500" />;
    }
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'owner':
        return 'warning';
      case 'admin':
        return 'info';
      default:
        return 'gray';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner size="xl" />
      </div>
    );
  }

  if (error) {
    return (
      <Alert color="failure" className="mb-4">
        {error}
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Users
          </h2>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
            Manage users in your organization
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <FaUserPlus className="mr-2" />
          Create User
        </Button>
      </div>

      <Card>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Joined
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
              {members.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className="shrink-0">
                        <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center">
                          {getRoleIcon(member.role)}
                        </div>
                      </div>
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {member.user?.name || 'Unknown'}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                      {member.user?.email || 'No email'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge color={getRoleBadgeColor(member.role)}>
                      {member.role}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                    {new Date(member.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {member.role !== 'owner' && (
                      <Button
                        size="sm"
                        color="failure"
                        onClick={() => handleRemoveMember(member.id)}
                        disabled={deletingMemberId === member.id}
                      >
                        <FaTrash className="mr-1" />
                        {deletingMemberId === member.id ? 'Removing...' : 'Remove'}
                      </Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {members.length === 0 && (
            <div className="text-center py-12">
              <FaUser className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
                No users yet
              </h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Get started by creating a new user.
              </p>
            </div>
          )}
        </div>
      </Card>

      <CreateUserModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={handleCreateUser}
      />
    </div>
  );
};

export default UsersPage;
