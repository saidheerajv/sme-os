import React, { useState } from 'react';
import { Modal, Button, Label, TextInput, Select, Alert } from 'flowbite-react';
import { FaUserPlus } from 'react-icons/fa';
import type { CreateUserDto } from '../types/organization.types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreateUserDto) => Promise<void>;
}

const CreateUserModal: React.FC<Props> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState<CreateUserDto>({
    email: '',
    password: '',
    name: '',
    role: 'member',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await onSubmit(formData);
      // Reset form
      setFormData({
        email: '',
        password: '',
        name: '',
        role: 'member',
      });
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create user');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: keyof CreateUserDto, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Modal show={isOpen} onClose={onClose} size="md">
      <div className="p-6">
        <div className="flex items-center gap-2 mb-6">
          <FaUserPlus className="text-primary-600 text-xl" />
          <h3 className="text-xl font-semibold">Create New User</h3>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert color="failure" onDismiss={() => setError(null)}>
              {error}
            </Alert>
          )}

          <div>
            <Label htmlFor="name">Full Name</Label>
            <TextInput
              id="name"
              type="text"
              placeholder="John Doe"
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="email">Email Address</Label>
            <TextInput
              id="email"
              type="email"
              placeholder="user@example.com"
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              required
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <TextInput
              id="password"
              type="password"
              placeholder="Enter password (min 6 characters)"
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              required
              minLength={6}
              disabled={loading}
            />
            <p className="mt-1 text-xs text-gray-500">
              Password must be at least 6 characters long
            </p>
          </div>

          <div>
            <Label htmlFor="role">Role</Label>
            <Select
              id="role"
              value={formData.role}
              onChange={(e) => handleChange('role', e.target.value as 'admin' | 'member')}
              required
              disabled={loading}
            >
              <option value="member">Member</option>
              <option value="admin">Admin</option>
            </Select>
            <p className="mt-1 text-xs text-gray-500">
              Members can view and edit content. Admins can manage users and settings.
            </p>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button color="gray" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create User'}
            </Button>
          </div>
        </form>
      </div>
    </Modal>
  );
};

export default CreateUserModal;
