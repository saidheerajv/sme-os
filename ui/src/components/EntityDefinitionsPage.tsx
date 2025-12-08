import React, { useState, useEffect } from 'react';
import { Card, Button, Badge, Modal, Alert } from 'flowbite-react';
import { HiPlus, HiPencil, HiTrash, HiCode } from 'react-icons/hi';
import { entityDefinitionsApi } from '../services/entityDefinitions.api';
import type { EntityDefinition, FieldDefinition } from '../types/entity.types';
import { FieldType } from '../types/entity.types';
import EntityDefinitionForm from './EntityDefinitionForm';

const EntityDefinitionsPage: React.FC = () => {
  const [entities, setEntities] = useState<EntityDefinition[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedEntity, setSelectedEntity] = useState<EntityDefinition | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [entityToDelete, setEntityToDelete] = useState<EntityDefinition | null>(null);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    loadEntities();
  }, []);

  const loadEntities = async () => {
    try {
      setLoading(true);
      const data = await entityDefinitionsApi.getAll();
      setEntities(data);
    } catch (error) {
      console.error('Failed to load entities:', error);
      showSnackbar('Failed to load entity definitions', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEntity = () => {
    setSelectedEntity(null);
    setIsFormOpen(true);
  };

  const handleEditEntity = (entity: EntityDefinition) => {
    setSelectedEntity(entity);
    setIsFormOpen(true);
  };

  const handleDeleteEntity = (entity: EntityDefinition) => {
    setEntityToDelete(entity);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!entityToDelete) return;

    try {
      await entityDefinitionsApi.delete(entityToDelete.name);
      setEntities(entities.filter(e => e.id !== entityToDelete.id));
      showSnackbar('Entity definition deleted successfully', 'success');
    } catch (error) {
      console.error('Failed to delete entity:', error);
      showSnackbar('Failed to delete entity definition', 'error');
    } finally {
      setIsDeleteConfirmOpen(false);
      setEntityToDelete(null);
    }
  };

  const handleFormSubmit = async (formData: { name: string; fields: FieldDefinition[] }) => {
    try {
      const newEntity = await entityDefinitionsApi.create(formData);
      setEntities([newEntity, ...entities]);
      setIsFormOpen(false);
      showSnackbar('Entity definition created successfully', 'success');
    } catch (error: any) {
      console.error('Failed to create entity:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create entity definition';
      showSnackbar(errorMessage, 'error');
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const getFieldTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      [FieldType.STRING]: 'info',
      [FieldType.NUMBER]: 'purple',
      [FieldType.BOOLEAN]: 'success',
      [FieldType.EMAIL]: 'indigo',
      [FieldType.DATE]: 'warning',
      [FieldType.URL]: 'failure',
    };
    return colors[type] || 'gray';
  };

  const renderFieldConstraints = (field: FieldDefinition) => {
    const constraints = [];

    if (field.required) constraints.push('Required');
    if (field.unique) constraints.push('Unique');
    if (field.minLength) constraints.push(`Min: ${field.minLength}`);
    if (field.maxLength) constraints.push(`Max: ${field.maxLength}`);
    if (field.min !== undefined) constraints.push(`Min: ${field.min}`);
    if (field.max !== undefined) constraints.push(`Max: ${field.max}`);
    if (field.pattern) constraints.push('Pattern');
    if (field.defaultValue !== undefined) constraints.push(`Default: ${field.defaultValue}`);

    return constraints.join(', ');
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto mt-8 mb-8">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto mt-8 mb-8">
      {/* Header */}
      <div className="flex items-center mb-6">

        <h1 className="text-3xl font-bold grow">Entity Definitions</h1>
        <Button color="blue" onClick={handleCreateEntity} size="sm">
          <HiPlus className="w-5 h-5 mr-1" /> Create Entity
        </Button>
      </div>

      {/* Description */}
      <Card className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Dynamic Entity Management</h2>
        <p className="text-gray-600 text-sm">
          Create and manage dynamic entity definitions that will automatically generate CRUD APIs. Each entity can have custom fields with validation rules and constraints.
        </p>
      </Card>

      {/* Entity Cards */}
      {entities.length === 0 ? (
        <Card className="p-8 text-center">
          <HiCode className="mx-auto mb-4 text-gray-400" style={{ fontSize: 48 }} />
          <h2 className="text-lg text-gray-500 mb-2">No Entity Definitions Found</h2>
          <p className="text-gray-400 mb-4">Create your first entity definition to get started with dynamic content management.</p>
          <Button color="blue" onClick={handleCreateEntity}>
            <HiPlus className="w-5 h-5 mr-1" /> Create Your First Entity
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {entities.map((entity) => (
            <Card key={entity.id} className="flex flex-col h-full">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-lg font-semibold">{entity.name}</h2>
                <Badge color="info">{entity.fields.length} fields</Badge>
              </div>
              <p className="text-gray-500 text-sm mb-2">Table: {entity.tableName}</p>
              <hr className="my-2" />
              <div className="font-medium text-sm mb-1">Fields:</div>
              <div className="max-h-40 overflow-y-auto">
                {entity.fields.map((field, index) => (
                  <div key={index} className="mb-2">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{field.name}</span>
                      <Badge color={getFieldTypeColor(field.type)}>{field.type}</Badge>
                    </div>
                    {renderFieldConstraints(field) && (
                      <span className="text-xs text-gray-400">{renderFieldConstraints(field)}</span>
                    )}
                  </div>
                ))}
              </div>
              <hr className="my-2" />
              <span className="text-xs text-gray-400">Created: {new Date(entity.createdAt).toLocaleDateString()}</span>
              <div className="flex gap-2 mt-4">
                <Button color="light" size="xs" onClick={() => handleEditEntity(entity)}>
                  <HiPencil className="w-4 h-4 mr-1" /> Edit
                </Button>
                <Button color="failure" size="xs" onClick={() => handleDeleteEntity(entity)}>
                  <HiTrash className="w-4 h-4 mr-1" /> Delete
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Entity Form Modal */}
      <Modal show={isFormOpen} onClose={() => setIsFormOpen(false)} size="xl">
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">
            {selectedEntity ? 'Edit Entity Definition' : 'Create Entity Definition'}
          </h3>
          <EntityDefinitionForm
            initialData={selectedEntity}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
          />
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal show={isDeleteConfirmOpen} onClose={() => setIsDeleteConfirmOpen(false)}>
        <div className="p-4">
          <h3 className="text-lg font-semibold mb-4">Confirm Delete</h3>
          <p className="mb-4">
            Are you sure you want to delete the entity definition "{entityToDelete?.name}"?
            This action cannot be undone and will also delete all data instances of this entity.
          </p>
          <div className="flex gap-2 justify-end">
            <Button color="light" onClick={() => setIsDeleteConfirmOpen(false)}>Cancel</Button>
            <Button color="failure" onClick={confirmDelete}>Delete</Button>
          </div>
        </div>
      </Modal>

      {/* Snackbar/Alert */}
      {snackbar.open && (
        <div className="fixed bottom-4 right-4 z-50">
          <Alert color={snackbar.severity === 'success' ? 'success' : 'failure'} onDismiss={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </div>
      )}
    </div>
  );
};

export default EntityDefinitionsPage;