import { useState } from 'react';
import { Button, Drawer, TextInput, Label, Checkbox, Spinner } from 'flowbite-react';
import type { EntityDefinition, FieldDefinition } from '../types/entity.types';
import type { EntityRecord } from '../services/entities.api';

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
    const [formData, setFormData] = useState<Record<string, any>>(initialData);
    const [submitting, setSubmitting] = useState(false);

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
        const value = formData[field.name] ?? field.defaultValue ?? '';

        switch (field.type) {
            case 'boolean':
                return (
                    <div key={field.name} className="mb-4">
                        <div className="flex items-center gap-2">
                            <Checkbox
                                id={field.name}
                                checked={!!value}
                                onChange={(e) => handleInputChange(field.name, e.target.checked)}
                            />
                            <Label htmlFor={field.name}>{field.name}</Label>
                            {field.required && <span className="text-red-500">*</span>}
                        </div>
                    </div>
                );

            case 'number':
                return (
                    <div key={field.name} className="mb-4">
                        <Label htmlFor={field.name}>
                            {field.name} {field.required && <span className="text-red-500">*</span>}
                        </Label>
                        <TextInput
                            id={field.name}
                            type="number"
                            value={value}
                            onChange={(e) => handleInputChange(field.name, parseFloat(e.target.value))}
                            required={field.required}
                            min={field.min}
                            max={field.max}
                        />
                    </div>
                );

            case 'date':
                return (
                    <div key={field.name} className="mb-4">
                        <Label htmlFor={field.name}>
                            {field.name} {field.required && <span className="text-red-500">*</span>}
                        </Label>
                        <TextInput
                            id={field.name}
                            type="date"
                            value={value ? new Date(value).toISOString().split('T')[0] : ''}
                            onChange={(e) => handleInputChange(field.name, e.target.value)}
                            required={field.required}
                        />
                    </div>
                );

            default: // string, email, url
                return (
                    <div key={field.name} className="mb-4">
                        <Label htmlFor={field.name}>
                            {field.name} {field.required && <span className="text-red-500">*</span>}
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
                        />
                    </div>
                );
        }
    };

    // Reset form data when modal opens with new initial data
    useState(() => {
        if (show) {
            setFormData(initialData);
        }
    });

    return (
        <Drawer open={show} onClose={onClose} position="right" className="w-96">
            <div className="p-6">
                <h3 className="text-xl font-semibold mb-6">
                    {editingRecord ? 'Edit Record' : 'Create New Record'}
                </h3>
                <form onSubmit={handleSubmit} className="space-y-4">
                    {entitySchema.fields.map(field => renderFormField(field))}
                    <div className="flex justify-end gap-2 mt-6 pt-4 border-t">
                        <Button color="gray" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={submitting}>
                            {submitting ? <Spinner size="sm" /> : editingRecord ? 'Update' : 'Create'}
                        </Button>
                    </div>
                </form>
            </div>
        </Drawer>
    );
};

export default EntityRecordForm;
