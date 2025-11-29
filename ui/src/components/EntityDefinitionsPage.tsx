import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Snackbar,
  Alert,
  Paper,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ArrowBack as ArrowBackIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { entityDefinitionsApi } from '../services/entityDefinitions.api';
import type { EntityDefinition, FieldDefinition } from '../types/entity.types';
import { FieldType } from '../types/entity.types';
import EntityDefinitionForm from './EntityDefinitionForm';

const EntityDefinitionsPage: React.FC = () => {
  const navigate = useNavigate();
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
    const colors: { [key: string]: 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'info' } = {
      [FieldType.STRING]: 'primary',
      [FieldType.NUMBER]: 'secondary',
      [FieldType.BOOLEAN]: 'success',
      [FieldType.EMAIL]: 'info',
      [FieldType.DATE]: 'warning',
      [FieldType.URL]: 'error',
    };
    return colors[type] || 'default';
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
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/dashboard')} sx={{ mr: 2 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography variant="h4" component="h1" sx={{ flexGrow: 1 }}>
          Entity Definitions
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleCreateEntity}
        >
          Create Entity
        </Button>
      </Box>

      {/* Description */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Dynamic Entity Management
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Create and manage dynamic entity definitions that will automatically generate CRUD APIs. 
          Each entity can have custom fields with validation rules and constraints.
        </Typography>
      </Paper>

      {/* Entity Cards */}
      {entities.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center' }}>
          <CodeIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            No Entity Definitions Found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Create your first entity definition to get started with dynamic content management.
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleCreateEntity}
          >
            Create Your First Entity
          </Button>
        </Paper>
      ) : (
        <Box sx={{ 
          display: 'grid', 
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' },
          gap: 3 
        }}>
          {entities.map((entity) => (
            <Card key={entity.id} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <CardContent sx={{ flexGrow: 1 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2 }}>
                  <Typography variant="h6" component="h2">
                    {entity.name}
                  </Typography>
                  <Chip label={`${entity.fields.length} fields`} size="small" />
                </Box>
                
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Table: {entity.tableName}
                </Typography>

                <Divider sx={{ my: 2 }} />

                <Typography variant="subtitle2" gutterBottom>
                  Fields:
                </Typography>
                <Box sx={{ maxHeight: 150, overflowY: 'auto' }}>
                  {entity.fields.map((field, index) => (
                    <Box key={index} sx={{ mb: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                        <Typography variant="body2" fontWeight="medium">
                          {field.name}
                        </Typography>
                        <Chip
                          label={field.type}
                          size="small"
                          color={getFieldTypeColor(field.type)}
                          variant="outlined"
                        />
                      </Box>
                      {renderFieldConstraints(field) && (
                        <Typography variant="caption" color="text.secondary">
                          {renderFieldConstraints(field)}
                        </Typography>
                      )}
                    </Box>
                  ))}
                </Box>

                <Divider sx={{ my: 2 }} />

                <Typography variant="caption" color="text.secondary">
                  Created: {new Date(entity.createdAt).toLocaleDateString()}
                </Typography>
              </CardContent>

              <CardActions>
                <Button
                  size="small"
                  startIcon={<EditIcon />}
                  onClick={() => handleEditEntity(entity)}
                >
                  Edit
                </Button>
                <Button
                  size="small"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={() => handleDeleteEntity(entity)}
                >
                  Delete
                </Button>
              </CardActions>
            </Card>
          ))}
        </Box>
      )}

      {/* Entity Form Dialog */}
      <Dialog
        open={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          {selectedEntity ? 'Edit Entity Definition' : 'Create Entity Definition'}
        </DialogTitle>
        <DialogContent>
          <EntityDefinitionForm
            initialData={selectedEntity}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={isDeleteConfirmOpen}
        onClose={() => setIsDeleteConfirmOpen(false)}
      >
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the entity definition "{entityToDelete?.name}"?
            This action cannot be undone and will also delete all data instances of this entity.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDeleteConfirmOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default EntityDefinitionsPage;