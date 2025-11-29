import React, { useState, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Card,
  CardContent,
  IconButton,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormControlLabel,
  Switch,
  Divider,
  Alert,
} from '@mui/material';
import {
  Add as AddIcon,
  Delete as DeleteIcon,
  ExpandMore as ExpandMoreIcon,
  ExpandLess as ExpandLessIcon,
} from '@mui/icons-material';
import type { EntityDefinition, FieldDefinition } from '../types/entity.types';
import { FieldType } from '../types/entity.types';

interface Props {
  initialData?: EntityDefinition | null;
  onSubmit: (data: { name: string; fields: FieldDefinition[] }) => void;
  onCancel: () => void;
}

interface FieldFormData extends FieldDefinition {
  id: string; // Temporary ID for form management
  showAdvanced?: boolean;
}

const EntityDefinitionForm: React.FC<Props> = ({ initialData, onSubmit, onCancel }) => {
  const [entityName, setEntityName] = useState('');
  const [fields, setFields] = useState<FieldFormData[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  useEffect(() => {
    if (initialData) {
      setEntityName(initialData.name);
      setFields(initialData.fields.map((field, index) => ({
        ...field,
        id: `field-${index}`,
        showAdvanced: false,
      })));
    } else {
      // Start with one empty field
      addField();
    }
  }, [initialData]);

  const addField = () => {
    const newField: FieldFormData = {
      id: `field-${Date.now()}`,
      name: '',
      type: FieldType.STRING,
      required: false,
      showAdvanced: false,
    };
    setFields([...fields, newField]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(field => field.id !== id));
  };

  const updateField = (id: string, updates: Partial<FieldFormData>) => {
    setFields(fields.map(field => 
      field.id === id ? { ...field, ...updates } : field
    ));
  };

  const toggleAdvanced = (id: string) => {
    updateField(id, { showAdvanced: !fields.find(f => f.id === id)?.showAdvanced });
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Validate entity name
    if (!entityName.trim()) {
      newErrors.entityName = 'Entity name is required';
    } else if (!/^[A-Za-z][A-Za-z0-9]*$/.test(entityName.trim())) {
      newErrors.entityName = 'Entity name must start with a letter and contain only letters and numbers';
    }

    // Validate fields
    if (fields.length === 0) {
      newErrors.fields = 'At least one field is required';
    }

    const fieldNames = new Set();
    fields.forEach((field) => {
      const fieldKey = `field-${field.id}`;
      
      if (!field.name.trim()) {
        newErrors[`${fieldKey}-name`] = 'Field name is required';
      } else if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(field.name.trim())) {
        newErrors[`${fieldKey}-name`] = 'Field name must start with a letter and contain only letters, numbers, and underscores';
      } else if (fieldNames.has(field.name.trim())) {
        newErrors[`${fieldKey}-name`] = 'Field name must be unique';
      } else {
        fieldNames.add(field.name.trim());
      }

      // Validate constraints based on field type
      if (field.type === FieldType.STRING) {
        if (field.minLength !== undefined && field.minLength < 0) {
          newErrors[`${fieldKey}-minLength`] = 'Minimum length cannot be negative';
        }
        if (field.maxLength !== undefined && field.maxLength < 1) {
          newErrors[`${fieldKey}-maxLength`] = 'Maximum length must be at least 1';
        }
        if (field.minLength !== undefined && field.maxLength !== undefined && field.minLength > field.maxLength) {
          newErrors[`${fieldKey}-maxLength`] = 'Maximum length must be greater than minimum length';
        }
      }

      if (field.type === FieldType.NUMBER) {
        if (field.min !== undefined && field.max !== undefined && field.min > field.max) {
          newErrors[`${fieldKey}-max`] = 'Maximum value must be greater than minimum value';
        }
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    // Prepare data for submission
    const formData = {
      name: entityName.trim(),
      fields: fields.map(field => {
        const cleanField: FieldDefinition = {
          name: field.name.trim(),
          type: field.type,
          required: field.required,
        };

        // Add optional properties only if they have values
        if (field.unique) cleanField.unique = field.unique;
        if (field.minLength !== undefined && field.minLength > 0) cleanField.minLength = field.minLength;
        if (field.maxLength !== undefined && field.maxLength > 0) cleanField.maxLength = field.maxLength;
        if (field.pattern?.trim()) cleanField.pattern = field.pattern.trim();
        if (field.min !== undefined) cleanField.min = field.min;
        if (field.max !== undefined) cleanField.max = field.max;
        if (field.defaultValue !== undefined && field.defaultValue !== '') cleanField.defaultValue = field.defaultValue;

        return cleanField;
      }),
    };

    onSubmit(formData);
  };

  const getFieldTypeOptions = () => [
    { value: FieldType.STRING, label: 'Text' },
    { value: FieldType.NUMBER, label: 'Number' },
    { value: FieldType.BOOLEAN, label: 'Boolean' },
    { value: FieldType.EMAIL, label: 'Email' },
    { value: FieldType.DATE, label: 'Date' },
    { value: FieldType.URL, label: 'URL' },
  ];

  const renderFieldConstraints = (field: FieldFormData) => {
    if (!field.showAdvanced) return null;

    return (
      <Box sx={{ mt: 2, p: 2, bgcolor: 'grey.50', borderRadius: 1 }}>
        <Typography variant="subtitle2" gutterBottom>
          Advanced Options
        </Typography>

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <FormControlLabel
            control={
              <Switch
                checked={field.unique || false}
                onChange={(e) => updateField(field.id, { unique: e.target.checked })}
              />
            }
            label="Unique"
          />

          {(field.type === FieldType.STRING || field.type === FieldType.EMAIL || field.type === FieldType.URL) && (
            <>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <TextField
                  fullWidth
                  size="small"
                  label="Min Length"
                  type="number"
                  value={field.minLength || ''}
                  onChange={(e) => updateField(field.id, { 
                    minLength: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                  error={!!errors[`field-${field.id}-minLength`]}
                  helperText={errors[`field-${field.id}-minLength`]}
                />
                <TextField
                  fullWidth
                  size="small"
                  label="Max Length"
                  type="number"
                  value={field.maxLength || ''}
                  onChange={(e) => updateField(field.id, { 
                    maxLength: e.target.value ? parseInt(e.target.value) : undefined 
                  })}
                  error={!!errors[`field-${field.id}-maxLength`]}
                  helperText={errors[`field-${field.id}-maxLength`]}
                />
              </Box>
              {field.type === FieldType.STRING && (
                <TextField
                  fullWidth
                  size="small"
                  label="Pattern (Regex)"
                  value={field.pattern || ''}
                  onChange={(e) => updateField(field.id, { pattern: e.target.value })}
                  placeholder="^[A-Z][a-z]*$"
                />
              )}
            </>
          )}

          {field.type === FieldType.NUMBER && (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                fullWidth
                size="small"
                label="Min Value"
                type="number"
                value={field.min !== undefined ? field.min : ''}
                onChange={(e) => updateField(field.id, { 
                  min: e.target.value ? parseFloat(e.target.value) : undefined 
                })}
                error={!!errors[`field-${field.id}-min`]}
                helperText={errors[`field-${field.id}-min`]}
              />
              <TextField
                fullWidth
                size="small"
                label="Max Value"
                type="number"
                value={field.max !== undefined ? field.max : ''}
                onChange={(e) => updateField(field.id, { 
                  max: e.target.value ? parseFloat(e.target.value) : undefined 
                })}
                error={!!errors[`field-${field.id}-max`]}
                helperText={errors[`field-${field.id}-max`]}
              />
            </Box>
          )}

          <TextField
            fullWidth
            size="small"
            label="Default Value"
            value={field.defaultValue !== undefined ? field.defaultValue : ''}
            onChange={(e) => updateField(field.id, { 
              defaultValue: e.target.value || undefined 
            })}
            type={field.type === FieldType.NUMBER ? 'number' : 'text'}
          />
        </Box>
      </Box>
    );
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
      {/* Entity Name */}
      <TextField
        fullWidth
        label="Entity Name"
        value={entityName}
        onChange={(e) => setEntityName(e.target.value)}
        error={!!errors.entityName}
        helperText={errors.entityName || 'e.g., Product, Customer, Article'}
        sx={{ mb: 3 }}
        placeholder="Product"
      />

      {/* Fields Section */}
      <Typography variant="h6" gutterBottom>
        Fields
      </Typography>

      {errors.fields && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {errors.fields}
        </Alert>
      )}

      {fields.map((field) => (
        <Card key={field.id} sx={{ mb: 2 }}>
          <CardContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              <Box sx={{ display: 'flex', gap: 2, alignItems: 'start', flexWrap: 'wrap' }}>
                <TextField
                  label="Field Name"
                  value={field.name}
                  onChange={(e) => updateField(field.id, { name: e.target.value })}
                  error={!!errors[`field-${field.id}-name`]}
                  helperText={errors[`field-${field.id}-name`]}
                  placeholder="title"
                  sx={{ minWidth: 200, flex: 1 }}
                />

                <FormControl sx={{ minWidth: 120 }}>
                  <InputLabel>Type</InputLabel>
                  <Select
                    value={field.type}
                    label="Type"
                    onChange={(e) => updateField(field.id, { type: e.target.value as FieldType })}
                  >
                    {getFieldTypeOptions().map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControlLabel
                  control={
                    <Switch
                      checked={field.required}
                      onChange={(e) => updateField(field.id, { required: e.target.checked })}
                    />
                  }
                  label="Required"
                />

                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                  <Button
                    size="small"
                    onClick={() => toggleAdvanced(field.id)}
                    startIcon={field.showAdvanced ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                  >
                    Advanced
                  </Button>
                  <IconButton 
                    color="error" 
                    onClick={() => removeField(field.id)}
                    disabled={fields.length === 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </Box>
              </Box>
            </Box>

            {renderFieldConstraints(field)}
          </CardContent>
        </Card>
      ))}

      <Button
        variant="outlined"
        startIcon={<AddIcon />}
        onClick={addField}
        sx={{ mb: 3 }}
      >
        Add Field
      </Button>

      {/* Form Actions */}
      <Divider sx={{ my: 3 }} />
      <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="contained">
          {initialData ? 'Update Entity' : 'Create Entity'}
        </Button>
      </Box>
    </Box>
  );
};

export default EntityDefinitionForm;