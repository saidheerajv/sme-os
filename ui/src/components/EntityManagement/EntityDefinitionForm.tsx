import React, { useState, useEffect } from 'react';
import {
  Card,
  Button,
  TextInput,
  Select,
  Alert,
  Badge,
  ToggleSwitch,
} from 'flowbite-react';
import { FaPlus, FaTrash, FaChevronDown, FaChevronUp, FaGripVertical, FaInfoCircle } from 'react-icons/fa';
import type { EntityDefinition, FieldDefinition, DropdownOption, KanbanConfig } from '../../types/entity.types';
import { FieldType, UIComponentType } from '../../types/entity.types';

interface Props {
  initialData?: EntityDefinition | null;
  onSubmit: (data: { name: string; fields: FieldDefinition[]; uiComponent: UIComponentType; uiConfig?: KanbanConfig }) => void;
  onCancel: () => void;
}

interface FieldFormData extends FieldDefinition {
  id: string; // Temporary ID for form management
  showAdvanced?: boolean;
}

// Helper function to convert display name to camelCase field name
const toCamelCase = (str: string): string => {
  return str
    .trim()
    .replace(/[^a-zA-Z0-9\s]/g, '') // Remove special characters
    .split(/\s+/)
    .map((word, index) => {
      if (index === 0) {
        return word.toLowerCase();
      }
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join('');
};

const EntityDefinitionForm: React.FC<Props> = ({ initialData, onSubmit, onCancel }) => {
  const [entityName, setEntityName] = useState('');
  const [fields, setFields] = useState<FieldFormData[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [uiComponent, setUiComponent] = useState<UIComponentType>(UIComponentType.DATATABLE);
  const [kanbanConfig, setKanbanConfig] = useState<KanbanConfig>({
    groupByField: '',
    titleField: '',
    descriptionField: '',
  });

  useEffect(() => {
    if (initialData) {
      setEntityName(initialData.name);
      setFields(initialData.fields.map((field, index) => ({
        ...field,
        id: `field-${index}`,
        showAdvanced: false,
        // Use displayName if available, otherwise derive from name
        displayName: field.displayName || field.name,
      })));
      setUiComponent((initialData.uiComponent as UIComponentType) || UIComponentType.DATATABLE);
      if (initialData.uiConfig) {
        setKanbanConfig({
          groupByField: initialData.uiConfig.groupByField || '',
          titleField: initialData.uiConfig.titleField || '',
          descriptionField: initialData.uiConfig.descriptionField || '',
        });
      }
    } else {
      // Start with one empty field
      addField();
    }
  }, [initialData]);

  const addField = () => {
    const newField: FieldFormData = {
      id: `field-${Date.now()}`,
      name: '',
      displayName: '',
      type: FieldType.STRING,
      required: false,
      showAdvanced: false,
      showInDataTable: true,
      showInForm: true,
      allowUpdate: true,
      span: 2,
    };
    setFields([...fields, newField]);
  };

  const removeField = (id: string) => {
    setFields(fields.filter(field => field.id !== id));
  };

  const updateField = (id: string, updates: Partial<FieldFormData>) => {
    setFields(fields.map(field => {
      if (field.id === id) {
        const updated = { ...field, ...updates };
        // Auto-generate field name from display name
        if ('displayName' in updates && updates.displayName !== undefined) {
          updated.name = toCamelCase(updates.displayName);
        }
        return updated;
      }
      return field;
    }));
  };

  const toggleAdvanced = (id: string) => {
    updateField(id, { showAdvanced: !fields.find(f => f.id === id)?.showAdvanced });
  };

  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Validate entity name
    if (!entityName.trim()) {
      newErrors.entityName = 'Module name is required';
    } else if (!/^[A-Za-z][A-Za-z0-9]*$/.test(entityName.trim())) {
      newErrors.entityName = 'Module name must start with a letter and contain only letters and numbers';
    }

    // Validate fields
    if (fields.length === 0) {
      newErrors.fields = 'At least one field is required';
    }

    const fieldNames = new Set();
    fields.forEach((field) => {
      const fieldKey = `field-${field.id}`;
      const generatedName = toCamelCase(field.displayName || '');

      if (!field.displayName?.trim()) {
        newErrors[`${fieldKey}-displayName`] = 'Field label is required';
      } else if (!generatedName) {
        newErrors[`${fieldKey}-displayName`] = 'Field label must contain at least one letter';
      } else if (fieldNames.has(generatedName)) {
        newErrors[`${fieldKey}-displayName`] = 'This will create a duplicate field name';
      } else {
        fieldNames.add(generatedName);
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

      if (field.type === FieldType.DROPDOWN) {
        if (!field.options || field.options.length === 0) {
          newErrors[`${fieldKey}-options`] = 'Dropdown must have at least one option';
        } else {
          field.options.forEach((opt, idx) => {
            if (!opt.label.trim()) {
              newErrors[`${fieldKey}-option-${idx}-label`] = 'Option label is required';
            }
            if (!opt.value.trim()) {
              newErrors[`${fieldKey}-option-${idx}-value`] = 'Option value is required';
            }
          });
        }
      }
    });

    // Validate kanban config
    if (uiComponent === UIComponentType.KANBAN) {
      if (!kanbanConfig.groupByField) {
        newErrors.kanbanGroupBy = 'Group By field is required for Kanban view';
      }
      if (!kanbanConfig.titleField) {
        newErrors.kanbanTitle = 'Title field is required for Kanban view';
      }
    }

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
          name: toCamelCase(field.displayName || ''),
          type: field.type,
          required: field.required,
        };

        // Add optional properties only if they have values
        if (field.unique) cleanField.unique = field.unique;
        if (field.displayName?.trim()) cleanField.displayName = field.displayName.trim();
        if (field.showInDataTable !== undefined) cleanField.showInDataTable = field.showInDataTable;
        if (field.showInForm !== undefined) cleanField.showInForm = field.showInForm;
        if (field.allowUpdate !== undefined) cleanField.allowUpdate = field.allowUpdate;
        if (field.enableSearch !== undefined) cleanField.enableSearch = field.enableSearch;
        if (field.span !== undefined) cleanField.span = field.span;
        if (field.minLength !== undefined && field.minLength > 0) cleanField.minLength = field.minLength;
        if (field.maxLength !== undefined && field.maxLength > 0) cleanField.maxLength = field.maxLength;
        if (field.pattern?.trim()) cleanField.pattern = field.pattern.trim();
        if (field.min !== undefined) cleanField.min = field.min;
        if (field.max !== undefined) cleanField.max = field.max;
        // Handle default value - allow false for booleans
        if (field.defaultValue !== undefined && (field.type === FieldType.BOOLEAN || field.defaultValue !== '')) {
          cleanField.defaultValue = field.defaultValue;
        }
        if (field.type === FieldType.DROPDOWN && field.options && field.options.length > 0) {
          cleanField.options = field.options.map(opt => ({ label: opt.label.trim(), value: opt.value.trim() }));
        }

        return cleanField;
      }),
      uiComponent,
      ...(uiComponent === UIComponentType.KANBAN ? {
        uiConfig: {
          groupByField: kanbanConfig.groupByField,
          titleField: kanbanConfig.titleField,
          ...(kanbanConfig.descriptionField ? { descriptionField: kanbanConfig.descriptionField } : {}),
        },
      } : {}),
    };

    onSubmit(formData);
  };

  const getFieldTypeOptions = () => [
    { value: FieldType.STRING, label: 'Text' },
    { value: FieldType.NUMBER, label: 'Number' },
    { value: FieldType.BOOLEAN, label: 'Boolean' },
    { value: FieldType.EMAIL, label: 'Email' },
    { value: FieldType.DATE, label: 'Date' },
    { value: FieldType.DATETIME, label: 'Date & Time' },
    { value: FieldType.TIME, label: 'Time' },
    { value: FieldType.URL, label: 'URL' },
    { value: FieldType.DROPDOWN, label: 'Dropdown' },
  ];

  const addDropdownOption = (fieldId: string) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field) return;
    const newOption: DropdownOption = { label: '', value: '' };
    const currentOptions = field.options || [];
    updateField(fieldId, { options: [...currentOptions, newOption] });
  };

  const updateDropdownOption = (fieldId: string, optionIndex: number, updates: Partial<DropdownOption>) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field || !field.options) return;
    const newOptions = field.options.map((opt, idx) =>
      idx === optionIndex ? { ...opt, ...updates } : opt
    );
    updateField(fieldId, { options: newOptions });
  };

  const removeDropdownOption = (fieldId: string, optionIndex: number) => {
    const field = fields.find(f => f.id === fieldId);
    if (!field || !field.options) return;
    const newOptions = field.options.filter((_, idx) => idx !== optionIndex);
    updateField(fieldId, { options: newOptions });
  };

  const renderFieldConstraints = (field: FieldFormData) => {
    if (!field.showAdvanced) return null;
    return (
      <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <div className="text-xs font-semibold text-gray-600 mb-3 uppercase tracking-wide">Advanced Options</div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={field.unique || false}
              onChange={e => updateField(field.id, { unique: e.target.checked })}
              className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-gray-700">Unique value</span>
          </label>

          {(field.type === FieldType.STRING || field.type === FieldType.EMAIL || field.type === FieldType.URL) && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Min Length</label>
                <input
                  type="number"
                  className="w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="0"
                  value={field.minLength || ''}
                  onChange={e => updateField(field.id, { minLength: e.target.value ? parseInt(e.target.value) : undefined })}
                  min={0}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Max Length</label>
                <input
                  type="number"
                  className="w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="No limit"
                  value={field.maxLength || ''}
                  onChange={e => updateField(field.id, { maxLength: e.target.value ? parseInt(e.target.value) : undefined })}
                  min={1}
                />
              </div>
            </>
          )}

          {field.type === FieldType.STRING && (
            <div className="md:col-span-2 lg:col-span-3">
              <label className="block text-xs font-medium text-gray-500 mb-1">Pattern (Regex)</label>
              <input
                type="text"
                className="w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500 font-mono"
                placeholder="e.g., ^[A-Z]{3}[0-9]{4}$"
                value={field.pattern || ''}
                onChange={e => updateField(field.id, { pattern: e.target.value })}
              />
            </div>
          )}

          {field.type === FieldType.NUMBER && (
            <>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Min Value</label>
                <input
                  type="number"
                  className="w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="No limit"
                  value={field.min !== undefined ? field.min : ''}
                  onChange={e => updateField(field.id, { min: e.target.value ? parseFloat(e.target.value) : undefined })}
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1">Max Value</label>
                <input
                  type="number"
                  className="w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
                  placeholder="No limit"
                  value={field.max !== undefined ? field.max : ''}
                  onChange={e => updateField(field.id, { max: e.target.value ? parseFloat(e.target.value) : undefined })}
                />
              </div>
            </>
          )}

          <div className={field.type === FieldType.STRING ? '' : field.type === FieldType.NUMBER ? '' : 'md:col-span-2'}>
            {renderDefaultValueInput(field)}
          </div>
        </div>
      </div>
    );
  };

  const renderDefaultValueInput = (field: FieldFormData) => {
    const label = <label className="block text-xs font-medium text-gray-500 mb-1">Default Value</label>;

    switch (field.type) {
      case FieldType.BOOLEAN:
        return (
          <div>
            {label}
            <label className="flex items-center gap-2 cursor-pointer mt-2">
              <input
                type="checkbox"
                checked={field.defaultValue === true || field.defaultValue === 'true'}
                onChange={e => updateField(field.id, { defaultValue: e.target.checked })}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Default checked</span>
            </label>
          </div>
        );

      case FieldType.NUMBER:
        return (
          <div>
            {label}
            <input
              type="number"
              className="w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder="Enter default number"
              value={field.defaultValue !== undefined ? field.defaultValue : ''}
              onChange={e => updateField(field.id, { defaultValue: e.target.value ? parseFloat(e.target.value) : undefined })}
            />
          </div>
        );

      case FieldType.DATE:
        return (
          <div>
            {label}
            <input
              type="date"
              className="w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
              value={field.defaultValue ? new Date(field.defaultValue).toISOString().split('T')[0] : ''}
              onChange={e => {
                const val = e.target.value;
                updateField(field.id, { defaultValue: val ? new Date(val + 'T00:00:00.000Z').toISOString() : undefined });
              }}
            />
          </div>
        );

      case FieldType.DATETIME:
        return (
          <div>
            {label}
            <input
              type="datetime-local"
              className="w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
              value={field.defaultValue ? new Date(field.defaultValue).toISOString().slice(0, 16) : ''}
              onChange={e => {
                const val = e.target.value;
                updateField(field.id, { defaultValue: val ? new Date(val).toISOString() : undefined });
              }}
            />
          </div>
        );

      case FieldType.TIME:
        return (
          <div>
            {label}
            <input
              type="time"
              className="w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
              value={field.defaultValue || ''}
              onChange={e => updateField(field.id, { defaultValue: e.target.value || undefined })}
            />
          </div>
        );

      case FieldType.DROPDOWN:
        return (
          <div>
            {label}
            <select
              className="w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
              value={field.defaultValue || ''}
              onChange={e => updateField(field.id, { defaultValue: e.target.value || undefined })}
            >
              <option value="">No default</option>
              {(field.options || []).map((opt, idx) => (
                <option key={idx} value={opt.value}>{opt.label || opt.value}</option>
              ))}
            </select>
          </div>
        );

      default: // STRING, EMAIL, URL
        return (
          <div>
            {label}
            <input
              type={field.type === FieldType.EMAIL ? 'email' : field.type === FieldType.URL ? 'url' : 'text'}
              className="w-full rounded-lg border-gray-300 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500"
              placeholder={field.type === FieldType.EMAIL ? 'name@example.com' : field.type === FieldType.URL ? 'https://example.com' : 'Enter default value'}
              value={field.defaultValue || ''}
              onChange={e => updateField(field.id, { defaultValue: e.target.value || undefined })}
            />
          </div>
        );
    }
  };

  const renderDropdownOptions = (field: FieldFormData) => {
    if (field.type !== FieldType.DROPDOWN) return null;
    const fieldKey = `field-${field.id}`;
    return (
      <div className="mt-4 p-4 bg-amber-50 rounded-lg border border-amber-200">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-semibold text-amber-700 uppercase tracking-wide">
            Dropdown Options
          </div>
          <Badge color="warning" size="sm">{(field.options || []).length} option{(field.options || []).length !== 1 ? 's' : ''}</Badge>
        </div>
        {errors[`${fieldKey}-options`] && (
          <Alert color="failure" className="mb-3 py-2">
            <span className="text-sm">{errors[`${fieldKey}-options`]}</span>
          </Alert>
        )}
        <div className="space-y-2">
          {(field.options || []).map((option, idx) => (
            <div key={idx} className="flex gap-2 items-start bg-white p-2 rounded border border-amber-100">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">Label</label>
                <input
                  type="text"
                  className={`w-full rounded-sm text-sm py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 ${errors[`${fieldKey}-option-${idx}-label`] ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Display text"
                  value={option.label}
                  onChange={e => updateDropdownOption(field.id, idx, { label: e.target.value })}
                />
                {errors[`${fieldKey}-option-${idx}-label`] && (
                  <div className="text-red-600 text-xs mt-1">{errors[`${fieldKey}-option-${idx}-label`]}</div>
                )}
              </div>
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-500 mb-1">Value</label>
                <input
                  type="text"
                  className={`w-full rounded-sm py-2 text-sm shadow-sm focus:border-primary-500 focus:ring-primary-500 ${errors[`${fieldKey}-option-${idx}-value`] ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Stored value"
                  value={option.value}
                  onChange={e => updateDropdownOption(field.id, idx, { value: e.target.value })}
                />
                {errors[`${fieldKey}-option-${idx}-value`] && (
                  <div className="text-red-600 text-xs mt-1">{errors[`${fieldKey}-option-${idx}-value`]}</div>
                )}
              </div>
              <div className="pt-5">
                <Button
                  size="xs"
                  color="failure"
                  onClick={() => removeDropdownOption(field.id, idx)}
                  title="Remove option"
                >
                  <FaTrash />
                </Button>
              </div>
            </div>
          ))}
        </div>
        <Button
          size="sm"
          color="warning"
          onClick={() => addDropdownOption(field.id)}
          className="mt-3 flex items-center gap-1"
        >
          <FaPlus /> Add Option
        </Button>
      </div>
    );
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      {/* Entity Name */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">Module Name</label>
        <TextInput
          type="text"
          value={entityName}
          onChange={(e) => setEntityName(e.target.value)}
          color={errors.entityName ? 'failure' : 'gray'}
          placeholder="e.g., Product, Customer, Article"
          required
        />
        {errors.entityName && (
          <div className="text-xs text-red-600 mt-1">{errors.entityName}</div>
        )}
      </div>

      {/* UI Component Selection */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-1">UI Component</label>
        <Select
          value={uiComponent}
          onChange={(e) => setUiComponent(e.target.value as UIComponentType)}
        >
          <option value={UIComponentType.DATATABLE}>Data Table</option>
          <option value={UIComponentType.KANBAN}>Kanban Board</option>
        </Select>
        <p className="text-xs text-gray-500 mt-1">
          Choose how records will be displayed. Data Table shows records in rows and columns. Kanban Board displays cards grouped by a status/category field.
        </p>
      </div>

      {/* Kanban Configuration */}
      {uiComponent === UIComponentType.KANBAN && (
        <div className="mb-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <div className="text-sm font-semibold text-purple-700 mb-3 uppercase tracking-wide">Kanban Configuration</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Group By Field <span className="text-red-500">*</span>
              </label>
              <Select
                value={kanbanConfig.groupByField}
                onChange={(e) => setKanbanConfig({ ...kanbanConfig, groupByField: e.target.value })}
                color={errors.kanbanGroupBy ? 'failure' : 'gray'}
              >
                <option value="">Select field...</option>
                {fields.filter(f => f.type === FieldType.DROPDOWN).map(f => (
                  <option key={f.id} value={toCamelCase(f.displayName || '')}>
                    {f.displayName || f.name}
                  </option>
                ))}
              </Select>
              {errors.kanbanGroupBy && (
                <div className="text-xs text-red-600 mt-1">{errors.kanbanGroupBy}</div>
              )}
              <p className="text-xs text-gray-400 mt-1">Dropdown field whose values become the kanban columns</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">
                Card Title Field <span className="text-red-500">*</span>
              </label>
              <Select
                value={kanbanConfig.titleField}
                onChange={(e) => setKanbanConfig({ ...kanbanConfig, titleField: e.target.value })}
                color={errors.kanbanTitle ? 'failure' : 'gray'}
              >
                <option value="">Select field...</option>
                {fields.filter(f => f.type === FieldType.STRING || f.type === FieldType.EMAIL).map(f => (
                  <option key={f.id} value={toCamelCase(f.displayName || '')}>
                    {f.displayName || f.name}
                  </option>
                ))}
              </Select>
              {errors.kanbanTitle && (
                <div className="text-xs text-red-600 mt-1">{errors.kanbanTitle}</div>
              )}
              <p className="text-xs text-gray-400 mt-1">Displayed as the card heading</p>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1">Card Description Field</label>
              <Select
                value={kanbanConfig.descriptionField || ''}
                onChange={(e) => setKanbanConfig({ ...kanbanConfig, descriptionField: e.target.value || undefined })}
              >
                <option value="">None</option>
                {fields.filter(f => f.type === FieldType.STRING).map(f => (
                  <option key={f.id} value={toCamelCase(f.displayName || '')}>
                    {f.displayName || f.name}
                  </option>
                ))}
              </Select>
              <p className="text-xs text-gray-400 mt-1">Optional text shown below the card title</p>
            </div>
          </div>
        </div>
      )}

      {/* Fields Section */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-lg font-semibold">Fields</h2>
        <Badge color="gray">{fields.length} field{fields.length !== 1 ? 's' : ''}</Badge>
      </div>

      {errors.fields && (
        <Alert color="failure" className="mb-3">
          {errors.fields}
        </Alert>
      )}

      <div className="space-y-3">
        {fields.map((field, index) => {
          const generatedName = toCamelCase(field.displayName || '');
          const fieldKey = `field-${field.id}`;

          return (
            <Card key={field.id} className="p-0 overflow-hidden">
              {/* Field Header */}
              <div className="bg-gray-50 px-4 py-2 border-b flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-gray-400">
                    <FaGripVertical className="cursor-move" />
                    <span className="text-sm font-medium w-6 h-6 flex items-center justify-center bg-gray-200 rounded-full text-gray-600">
                      {index + 1}
                    </span>
                  </div>
                  {field.displayName && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-700">{field.displayName}</span>
                      {generatedName && (
                        <code className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">
                          {generatedName}
                        </code>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    size="xs"
                    color="light"
                    onClick={() => toggleAdvanced(field.id)}
                    className="flex items-center gap-1"
                  >
                    {field.showAdvanced ? <FaChevronUp /> : <FaChevronDown />}
                    <span className="hidden sm:inline">Advanced</span>
                  </Button>
                  <Button
                    size="xs"
                    color="failure"
                    onClick={() => removeField(field.id)}
                    disabled={fields.length === 1}
                    title="Remove field"
                  >
                    <FaTrash />
                  </Button>
                </div>
              </div>

              <div className="p-4">
                {/* Main Field Settings Row */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-start">
                  {/* Display Name (Label) */}
                  <div className="md:col-span-4">
                    <label className="block text-xs font-medium text-gray-500 mb-1">
                      Field Label <span className="text-red-500">*</span>
                    </label>
                    <TextInput
                      type="text"
                      value={field.displayName || ''}
                      onChange={(e) => updateField(field.id, { displayName: e.target.value })}
                      color={errors[`${fieldKey}-displayName`] ? 'failure' : 'gray'}
                      placeholder="e.g., Product Name"
                      sizing="sm"
                    />
                    {errors[`${fieldKey}-displayName`] ? (
                      <div className="text-xs text-red-600 mt-1">{errors[`${fieldKey}-displayName`]}</div>
                    ) : generatedName && (
                      <div className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                        <FaInfoCircle className="text-gray-300" />
                        Field ID: <code className="bg-gray-100 px-1 rounded">{generatedName}</code>
                      </div>
                    )}
                  </div>

                  {/* Field Type */}
                  <div className="md:col-span-3">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Type</label>
                    <Select
                      value={field.type}
                      onChange={(e) => updateField(field.id, { type: e.target.value as FieldType })}
                      sizing="sm"
                    >
                      {getFieldTypeOptions().map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </Select>
                  </div>

                  {/* Required Toggle */}
                  <div className="md:col-span-2 flex flex-col">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Required</label>
                    <div className="flex items-center h-[38px]">
                      <ToggleSwitch
                        checked={field.required}
                        onChange={(checked) => updateField(field.id, { required: checked })}
                        sizing="sm"
                      />
                    </div>
                  </div>

                  {/* Form Width */}
                  <div className="md:col-span-3">
                    <label className="block text-xs font-medium text-gray-500 mb-1">Form Width</label>
                    <Select
                      value={field.span ?? 2}
                      onChange={(e) => updateField(field.id, { span: parseInt(e.target.value) as 1 | 2 | 3 | 4 })}
                      sizing="sm"
                    >
                      <option value={1}>25%</option>
                      <option value={2}>50%</option>
                      <option value={3}>75%</option>
                      <option value={4}>100%</option>
                    </Select>
                  </div>
                </div>

                {/* Data Table & Form Configuration - Side by Side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  {/* Data Table Configuration */}
                  <div className="p-3 bg-primary-50 rounded-lg border border-primary-100">
                    <div className="text-xs font-semibold text-primary-700 mb-2 uppercase tracking-wide">
                      Data Table
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={field.showInDataTable ?? true}
                          onChange={(e) => updateField(field.id, { showInDataTable: e.target.checked })}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">Show in table</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={field.enableSearch ?? false}
                          onChange={(e) => updateField(field.id, { enableSearch: e.target.checked })}
                          className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-gray-700">Enable search</span>
                      </label>
                    </div>
                  </div>

                  {/* Form Configuration */}
                  <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                    <div className="text-xs font-semibold text-green-700 mb-2 uppercase tracking-wide">
                      Form Settings
                    </div>
                    <div className="space-y-2">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={field.showInForm ?? true}
                          onChange={(e) => updateField(field.id, { showInForm: e.target.checked })}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">Show in form</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={field.allowUpdate ?? true}
                          onChange={(e) => updateField(field.id, { allowUpdate: e.target.checked })}
                          className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                        />
                        <span className="text-sm text-gray-700">Allow updates</span>
                      </label>
                    </div>
                  </div>
                </div>

                {renderDropdownOptions(field)}
                {renderFieldConstraints(field)}
              </div>
            </Card>
          );
        })}
      </div>

      <div className='text-center flex justify-center'>
        <Button color="secondary" onClick={addField} className="my-4 flex items-center gap-2">
          <FaPlus /> Add Field
        </Button>
      </div>


      {/* Form Actions */}
      <div className="flex gap-2 justify-end pt-4 mt-4">
        <Button color="light" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" color="primary">
          {initialData ? 'Update Module' : 'Create Module'}
        </Button>
      </div>
    </form>
  );
};

export default EntityDefinitionForm;