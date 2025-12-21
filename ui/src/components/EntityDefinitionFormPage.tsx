import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Alert } from 'flowbite-react';
import EntityDefinitionForm from './EntityDefinitionForm';
import { entityDefinitionsApi } from '../services/entityDefinitions.api';
import type { EntityDefinition, FieldDefinition } from '../types/entity.types';

const EntityDefinitionFormPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const entityToEdit = location.state?.entity as EntityDefinition | undefined;
  
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (formData: { name: string; fields: FieldDefinition[] }) => {
    try {
      if (entityToEdit) {
        // Update existing entity
        await entityDefinitionsApi.update(entityToEdit.name, formData);
      } else {
        // Create new entity
        await entityDefinitionsApi.create(formData);
      }
      navigate('/dashboard/entity-definitions');
    } catch (error: any) {
      console.error('Failed to save entity:', error);
      const errorMessage = error.response?.data?.message || `Failed to ${entityToEdit ? 'update' : 'create'} entity definition`;
      setError(errorMessage);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/entity-definitions');
  };

  return (
    <div className="max-w-5xl mx-auto mt-8 mb-8">
      <Card className="p-6">
        <h1 className="text-2xl font-bold mb-6">
          {entityToEdit ? 'Edit Entity Definition' : 'Create New Entity Definition'}
        </h1>
        
        {error && (
          <Alert color="failure" className="mb-4" onDismiss={() => setError(null)}>
            {error}
          </Alert>
        )}

        <EntityDefinitionForm
          initialData={entityToEdit}
          onSubmit={handleFormSubmit}
          onCancel={handleCancel}
        />
      </Card>
    </div>
  );
};

export default EntityDefinitionFormPage;
