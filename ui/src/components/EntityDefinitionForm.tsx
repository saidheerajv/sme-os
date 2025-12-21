import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  TextInput,
  Select,
  Checkbox,
  Alert,
} from 'flowbite-react';
import { FaPlus, FaTrash, FaChevronDown, FaChevronUp } from 'react-icons/fa';
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
        if (field.displayName?.trim()) cleanField.displayName = field.displayName.trim();
        if (field.showInDataTable !== undefined) cleanField.showInDataTable = field.showInDataTable;
        if (field.showInForm !== undefined) cleanField.showInForm = field.showInForm;
        if (field.allowUpdate !== undefined) cleanField.allowUpdate = field.allowUpdate;
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
      <div className="mt-2 p-4 bg-gray-50 rounded">
        <div className="text-sm font-semibold mb-2">Advanced Options</div>
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={field.unique || false}
              onChange={e => updateField(field.id, { unique: e.target.checked })}
              id={`unique-${field.id}`}
            />
            <label htmlFor={`unique-${field.id}`}>Unique</label>
          </div>
          {(field.type === FieldType.STRING || field.type === FieldType.EMAIL || field.type === FieldType.URL) && (
            <div className="flex gap-2">
              <input
                type="number"
                className="border rounded px-2 py-1 w-1/2"
                placeholder="Min Length"
                value={field.minLength || ''}
                onChange={e => updateField(field.id, { minLength: e.target.value ? parseInt(e.target.value) : undefined })}
                min={0}
              />
              <input
                type="number"
                className="border rounded px-2 py-1 w-1/2"
                placeholder="Max Length"
                value={field.maxLength || ''}
                onChange={e => updateField(field.id, { maxLength: e.target.value ? parseInt(e.target.value) : undefined })}
                min={1}
              />
            </div>
          )}
          {field.type === FieldType.STRING && (
            <input
              type="text"
              className="border rounded px-2 py-1 w-full"
              placeholder="Pattern (Regex)"
              value={field.pattern || ''}
              onChange={e => updateField(field.id, { pattern: e.target.value })}
            />
          )}
          {field.type === FieldType.NUMBER && (
            <div className="flex gap-2">
              <input
                type="number"
                className="border rounded px-2 py-1 w-1/2"
                placeholder="Min Value"
                value={field.min !== undefined ? field.min : ''}
                onChange={e => updateField(field.id, { min: e.target.value ? parseFloat(e.target.value) : undefined })}
              />
              <input
                type="number"
                className="border rounded px-2 py-1 w-1/2"
                placeholder="Max Value"
                value={field.max !== undefined ? field.max : ''}
                onChange={e => updateField(field.id, { max: e.target.value ? parseFloat(e.target.value) : undefined })}
              />
            </div>
          )}
          <input
            type={field.type === FieldType.NUMBER ? 'number' : 'text'}
            className="border rounded px-2 py-1 w-full"
            placeholder="Default Value"
            value={field.defaultValue !== undefined ? field.defaultValue : ''}
            onChange={e => updateField(field.id, { defaultValue: e.target.value || undefined })}
          />
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      {/* Entity Name */}
      <TextInput
        type="text"
        value={entityName}
        onChange={(e) => setEntityName(e.target.value)}
        color={errors.entityName ? 'failure' : 'gray'}
        className="mb-1"
        placeholder="Product"
        required
      />
      <div className={`text-xs mb-4 ${errors.entityName ? 'text-red-600' : 'text-gray-500'}`}>{errors.entityName || 'e.g., Product, Customer, Article'}</div>

      {/* Fields Section */}
      <h2 className="text-lg font-semibold mb-2">Fields</h2>

      {errors.fields && (
        <Alert color="failure" className="mb-2">
          {errors.fields}
        </Alert>
      )}

      {fields.map((field) => (
        <Card key={field.id} className="mb-3 p-4">
          <div className="flex flex-col gap-3">
            <div className="flex flex-wrap gap-3 items-start">
              <div className="flex flex-col flex-1 min-w-[200px]">
                <TextInput
                  type="text"
                  value={field.name}
                  onChange={(e) => updateField(field.id, { name: e.target.value })}
                  color={errors[`field-${field.id}-name`] ? 'failure' : 'gray'}
                  placeholder="title"
                  required
                  className="mb-1"
                />
                <div className={`text-xs ${errors[`field-${field.id}-name`] ? 'text-red-600' : 'text-gray-500'}`}>{errors[`field-${field.id}-name`] || 'Field name (camelCase)'}</div>
              </div>
              <div className="flex flex-col flex-1 min-w-[200px]">
                <TextInput
                  type="text"
                  value={field.displayName || ''}
                  onChange={(e) => updateField(field.id, { displayName: e.target.value })}
                  placeholder="Title"
                  className="mb-1"
                />
                <div className="text-xs text-gray-500">Display label (optional)</div>
              </div>
              <Select
                value={field.type}
                onChange={(e) => updateField(field.id, { type: e.target.value as FieldType })}
                className="min-w-[120px]"
              >
                {getFieldTypeOptions().map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </Select>
              <div className="flex items-center gap-2">
                <Checkbox
                  checked={field.required}
                  onChange={(e) => updateField(field.id, { required: e.target.checked })}
                />
                <span>Required</span>
              </div>
              <div className="flex gap-2 items-center">
                <Button
                  size="sm"
                  color="light"
                  onClick={() => toggleAdvanced(field.id)}
                  className="flex items-center gap-1"
                >
                  {field.showAdvanced ? <FaChevronUp /> : <FaChevronDown />} Advanced
                </Button>
                <Button
                  size="sm"
                  color="failure"
                  onClick={() => removeField(field.id)}
                  disabled={fields.length === 1}
                  className="flex items-center"
                >
                  <FaTrash />
                </Button>
              </div>
            </div>
            
            {/* Data Table Configuration */}
            <div className="mt-3 p-3 bg-blue-50 rounded">
              <div className="text-sm font-semibold mb-2">Data Table Configuration</div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={field.showInDataTable ?? true}
                  onChange={(e) => updateField(field.id, { showInDataTable: e.target.checked })}
                  id={`showInDataTable-${field.id}`}
                />
                <label htmlFor={`showInDataTable-${field.id}`}>Show in Data Table</label>
              </div>
            </div>

            {/* Form Configuration */}
            <div className="mt-3 p-3 bg-green-50 rounded">
              <div className="text-sm font-semibold mb-2">Form Configuration</div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={field.showInForm ?? true}
                    onChange={(e) => updateField(field.id, { showInForm: e.target.checked })}
                    id={`showInForm-${field.id}`}
                  />
                  <label htmlFor={`showInForm-${field.id}`}>Show in Form</label>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={field.allowUpdate ?? true}
                    onChange={(e) => updateField(field.id, { allowUpdate: e.target.checked })}
                    id={`allowUpdate-${field.id}`}
                  />
                  <label htmlFor={`allowUpdate-${field.id}`}>Allow Update</label>
                </div>
              </div>
            </div>

            {renderFieldConstraints(field)}
          </div>
        </Card>
      ))}

      <Button color="success" onClick={addField} className="mb-3 flex items-center gap-2">
        <FaPlus /> Add Field
      </Button>

      {/* Form Actions */}
      <hr className="my-4" />
      <div className="flex gap-2 justify-end">
        <Button color="light" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" color="success">
          {initialData ? 'Update Entity' : 'Create Entity'}
        </Button>
      </div>
    </form>
  );
};

export default EntityDefinitionForm;