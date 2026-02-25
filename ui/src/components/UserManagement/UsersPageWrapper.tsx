import React from 'react';
import { Alert } from 'flowbite-react';
import UsersPage from './UsersPage';
import { useAuth } from '../../contexts/AuthContext';

const UsersPageWrapper: React.FC = () => {
  const { currentOrganization } = useAuth();

  if (!currentOrganization) {
    return (
      <div className="p-6">
        <Alert color="warning">
          Please select an organization to manage users.
        </Alert>
      </div>
    );
  }

  return <UsersPage organizationId={currentOrganization.id} />;
};

export default UsersPageWrapper;
