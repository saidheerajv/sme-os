import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Card, Alert } from 'flowbite-react';
import EntityDefinitionForm from './EntityDefinitionForm';
import { entityDefinitionsApi } from '../../services/entityDefinitions.api';
import type { EntityDefinition, FieldDefinition, KanbanConfig } from '../../types/entity.types';
import type { UIComponentType } from '../../types/entity.types';

const EntityDefinitionFormPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const entityToEdit = location.state?.entity as EntityDefinition | undefined;
  
  const [error, setError] = useState<string | null>(null);

  const handleFormSubmit = async (formData: { name: string; fields: FieldDefinition[]; uiComponent: UIComponentType; uiConfig?: KanbanConfig }) => {
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
      const errorMessage = error.response?.data?.message || `Failed to ${entityToEdit ? 'update' : 'create'} module definition`;
      setError(errorMessage);
    }
  };

  const handleCancel = () => {
    navigate('/dashboard/entity-definitions');
  };

  return (
    <div className="max-w-full">
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-2">
          {entityToEdit ? 'Edit Module Definition' : 'Create New Module Definition'}
        </h2>
        
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
