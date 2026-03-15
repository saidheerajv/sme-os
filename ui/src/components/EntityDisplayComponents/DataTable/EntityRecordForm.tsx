import { useState, useEffect, useMemo } from 'react';
import { Button, Drawer, TextInput, Label, Checkbox, Spinner, Select } from 'flowbite-react';
import type { EntityDefinition, FieldDefinition } from '../../../types/entity.types';
import type { EntityRecord } from '../../../services/entities.api';

interface EntityRecordFormProps {
    show: boolean;
    onClose: () => void;
    onSubmit: (formData: Record<string, any>) => Promise<void>;
    entitySchema: EntityDefinition;
    editingRecord: EntityRecord | null;
    initialData?: Record<string, any>;
}

const EntityRecordForm: React.FC<EntityRecordFormProps> = ({
    show,
    onClose,
    onSubmit,
    entitySchema,
    editingRecord,
    initialData = {}
}) => {

    // Build default values from entity schema
    const defaultValues = useMemo(() => {
        const defaults: Record<string, any> = {};
        entitySchema.fields.forEach(field => {
            // Include default value if defined (allow false for booleans)
            if (field.defaultValue !== undefined && (field.type === 'boolean' || field.defaultValue !== '')) {
                defaults[field.name] = field.defaultValue;
            }
        });
        return defaults;
    }, [entitySchema.fields]);

    // Initialize form with default values merged with initial data
    const getInitialFormData = () => {
        if (editingRecord) {
            return initialData; // Use existing data when editing
        }
        return { ...defaultValues, ...initialData }; // Merge defaults with initial data for new records
    };

    const [formData, setFormData] = useState<Record<string, any>>(getInitialFormData);
    const [submitting, setSubmitting] = useState(false);

    // Reset form when modal opens/closes or editing record changes
    useEffect(() => {
        if (show) {
            setFormData(getInitialFormData());
        }
    }, [show, editingRecord, defaultValues]);

    const handleInputChange = (fieldName: string, value: any) => {
        setFormData(prev => ({ ...prev, [fieldName]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await onSubmit(formData);
            setFormData({});
        } catch (err) {
            // Error handling is done in parent
        } finally {
            setSubmitting(false);
        }
    };

    const renderFormField = (field: FieldDefinition) => {
        // Skip fields not marked for form display
        if (field.showInForm === false) {
            return null;
        }

        // Skip fields that don't allow updates when in edit mode
        if (editingRecord && field.allowUpdate === false) {
            return null;
        }

        const value = formData[field.name] ?? '';
        const fieldLabel = field.displayName || field.name;
        
        // Get span class based on field configuration (default: 2)
        const span = field.span ?? 2;
        const spanClass = {
            1: 'col-span-1',
            2: 'col-span-2',
            3: 'col-span-3',
            4: 'col-span-4',
        }[span] || 'col-span-2';

        switch (field.type) {
            case 'boolean':
                return (
                    <div key={field.name} className={spanClass}>
                        <div className="flex items-center gap-2 h-full pt-6">
                            <Checkbox
                                id={field.name}
                                checked={!!value}
                                onChange={(e) => handleInputChange(field.name, e.target.checked)}
                            />
                            <Label htmlFor={field.name}>{fieldLabel}</Label>
                            {field.required && <span className="text-red-500">*</span>}
                        </div>
                    </div>
                );

            case 'number':
                return (
                    <div key={field.name} className={spanClass}>
                        <Label htmlFor={field.name}>
                            {fieldLabel} {field.required && <span className="text-red-500">*</span>}
                        </Label>
                        <TextInput
                            id={field.name}
                            type="number"
                            value={value === '' || value === undefined || value === null ? '' : value}
                            onChange={(e) => {
                                const val = e.target.value;
                                handleInputChange(field.name, val === '' ? '' : parseFloat(val));
                            }}
                            required={field.required}
                            min={field.min}
                            max={field.max}
                            placeholder={`Enter ${fieldLabel.toLowerCase()}`}
                        />
                    </div>
                );

            case 'date':
                return (
                    <div key={field.name} className={spanClass}>
                        <Label htmlFor={field.name}>
                            {fieldLabel} {field.required && <span className="text-red-500">*</span>}
                        </Label>
                        <TextInput
                            id={field.name}
                            type="date"
                            value={value ? new Date(value).toISOString().split('T')[0] : ''}
                            onChange={(e) => {
                                // Convert date string to ISO datetime format for backend
                                const dateValue = e.target.value;
                                if (dateValue) {
                                    // Create a date object at midnight UTC
                                    const isoDateTime = new Date(dateValue + 'T00:00:00.000Z').toISOString();
                                    handleInputChange(field.name, isoDateTime);
                                } else {
                                    handleInputChange(field.name, '');
                                }
                            }}
                            required={field.required}
                        />
                    </div>
                );

            case 'datetime':
                return (
                    <div key={field.name} className={spanClass}>
                        <Label htmlFor={field.name}>
                            {fieldLabel} {field.required && <span className="text-red-500">*</span>}
                        </Label>
                        <TextInput
                            id={field.name}
                            type="datetime-local"
                            value={value ? new Date(value).toISOString().slice(0, 16) : ''}
                            onChange={(e) => {
                                const dateTimeValue = e.target.value;
                                if (dateTimeValue) {
                                    // Convert local datetime to ISO format
                                    const isoDateTime = new Date(dateTimeValue).toISOString();
                                    handleInputChange(field.name, isoDateTime);
                                } else {
                                    handleInputChange(field.name, '');
                                }
                            }}
                            required={field.required}
                        />
                    </div>
                );

            case 'time':
                return (
                    <div key={field.name} className={spanClass}>
                        <Label htmlFor={field.name}>
                            {fieldLabel} {field.required && <span className="text-red-500">*</span>}
                        </Label>
                        <TextInput
                            id={field.name}
                            type="time"
                            value={value || ''}
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                            required={field.required}
                        />
                    </div>
                );

            case 'dropdown':
                return (
                    <div key={field.name} className={spanClass}>
                        <Label htmlFor={field.name}>
                            {fieldLabel} {field.required && <span className="text-red-500">*</span>}
                        </Label>
                        <Select
                            id={field.name}
                            value={value}
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                            required={field.required}
                        >
                            <option value="">Select {fieldLabel.toLowerCase()}</option>
                            {field.options?.map((option) => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </Select>
                    </div>
                );

            default: // string, email, url
                return (
                    <div key={field.name} className={spanClass}>
                        <Label htmlFor={field.name}>
                            {fieldLabel} {field.required && <span className="text-red-500">*</span>}
                        </Label>
                        <TextInput
                            id={field.name}
                            type={field.type === 'email' ? 'email' : field.type === 'url' ? 'url' : 'text'}
                            value={value}
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                            required={field.required}
                            minLength={field.minLength}
                            maxLength={field.maxLength}
                            pattern={field.pattern}
                            placeholder={field.type === 'email' ? 'name@example.com' : field.type === 'url' ? 'https://example.com' : `Enter ${fieldLabel.toLowerCase()}`}
                        />
                    </div>
                );
        }
    };

    return (
        <Drawer open={show} onClose={onClose} position="right" className="w-240">
            <div className="p-6">
                <h3 className="text-xl font-semibold mb-6">
                    {editingRecord ? 'Edit Record' : 'Add New Record'}
                </h3>
                <form onSubmit={handleSubmit}>
                    <div className="grid grid-cols-4 gap-4 mb-6">
                        {entitySchema.fields.map(field => renderFormField(field))}
                    </div>
                    <div className="flex justify-end gap-2 pt-3">
                        <Button color="gray" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? <Spinner size="sm" /> : editingRecord ? 'Update' : 'Add'}
                        </Button>
                    </div>
                </form>
            </div>
        </Drawer>
    );
};

export default EntityRecordForm;
