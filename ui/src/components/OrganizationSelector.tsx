import React from 'react';
import { Select } from 'flowbite-react';
import { useAuth } from '../contexts/AuthContext';
import { FaBuilding } from 'react-icons/fa';

interface OrganizationSelectorProps {
  className?: string;
}

const OrganizationSelector: React.FC<OrganizationSelectorProps> = ({ className = '' }) => {
  const { currentOrganization, organizations, setCurrentOrganization } = useAuth();

  const handleOrganizationChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const orgId = e.target.value;
    const org = organizations.find(o => o.id === orgId);
    if (org) {
      setCurrentOrganization(org);
    }
  };

  if (organizations.length === 0) {
    return null;
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <FaBuilding className="text-gray-500" />
      <Select
        value={currentOrganization?.id || ''}
        onChange={handleOrganizationChange}
        sizing="sm"
        className="min-w-[200px]"
      >
        {organizations.map((org) => (
          <option key={org.id} value={org.id}>
            {org.name}
          </option>
        ))}
      </Select>
    </div>
  );
};

export default OrganizationSelector;
