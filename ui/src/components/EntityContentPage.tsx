import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Button, Modal, TextInput, Label, Checkbox, Spinner, Alert } from 'flowbite-react';
import { entityDefinitionsApi } from '../services/entityDefinitions.api';
import { entitiesApi, type EntityRecord } from '../services/entities.api';
import type { EntityDefinition, FieldDefinition } from '../types/entity.types';
import { HiPlus } from 'react-icons/hi';
import DataTable from './DataTable';

const EntityContentPage: React.FC = () => {

    const { entityName } = useParams<{ entityName: string }>();
    const [entitySchema, setEntitySchema] = useState<EntityDefinition | null>(null);
    const [entityData, setEntityData] = useState<EntityRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState<EntityRecord | null>(null);
    const [formData, setFormData] = useState<Record<string, any>>({});
    const [submitting, setSubmitting] = useState(false);

    // Fetch entity schema and data
    useEffect(() => {
        if (!entityName) return;
        
        const fetchData = async () => {
            setLoading(true);
            setError(null);
            try {
                const [schema, data]:any = await Promise.all([
                    entityDefinitionsApi.getByName(entityName),
                    entitiesApi.getAll(entityName)
                ]);

                console.log('Fetched entity schema:', schema);
                console.log('Fetched entity data:', data);
                setEntitySchema(schema);
                setEntityData(data.data.map((item: any) => item.data));
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to load entity data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [entityName]);




    // Handle create/edit modal
    const handleCreate = () => {
        setEditingRecord(null);
        setFormData({});
        setShowModal(true);
    };

    const handleEdit = (record: EntityRecord) => {
        setEditingRecord(record);
        setFormData(record);
        setShowModal(true);
    };

    const handleDelete = async (record: EntityRecord) => {
        if (!entityName || !confirm('Are you sure you want to delete this record?')) return;
        
        try {
            await entitiesApi.delete(entityName, record.id);
            setEntityData(prev => prev.filter(item => item.id !== record.id));
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to delete record');
        }
    };



    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!entityName) return;

        setSubmitting(true);
        try {
            if (editingRecord) {
                const updated = await entitiesApi.update(entityName, editingRecord.id, formData);
                setEntityData(prev => prev.map(item => item.id === editingRecord.id ? updated : item));
            } else {
                await entitiesApi.create(entityName, formData);
                // Refresh data after creation
                const data: any = await entitiesApi.getAll(entityName);
                setEntityData(data.data);
            }
            setShowModal(false);
            setFormData({});
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to save record');
        } finally {
            setSubmitting(false);
        }
    };

    const handleInputChange = (fieldName: string, value: any) => {
        setFormData(prev => ({ ...prev, [fieldName]: value }));
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

    if (loading) {
        return (
            <div className="flex justify-center items-center h-96">
                <Spinner size="xl" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-6xl mx-auto mt-8 mb-8">
                <Alert color="failure">
                    <span className="font-medium">Error!</span> {error}
                </Alert>
            </div>
        );
    }

    if (!entitySchema) {
        return (
            <div className="max-w-6xl mx-auto mt-8 mb-8">
                <Alert color="warning">
                    <span className="font-medium">Not Found!</span> Entity schema not found.
                </Alert>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto mt-8 mb-8 px-4">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold capitalize">{entityName} Content</h1>
                <Button onClick={handleCreate}>
                    <HiPlus className="mr-2 h-5 w-5" />
                    Add New
                </Button>
            </div>

            <Card>
                {entityData.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        <p className="text-lg">No records found</p>
                        <p className="text-sm mt-2">Click "Add New" to create your first record</p>
                    </div>
                ) : (
                    <DataTable 
                        data={entityData} 
                        schema={entitySchema} 
                        onEdit={handleEdit}
                        onDelete={handleDelete}
                    />
                )}
            </Card>

            {/* Create/Edit Modal */}
            <Modal show={showModal} onClose={() => setShowModal(false)} position="center-right">
                <div className="p-6">
                    <h3 className="text-xl font-semibold mb-4">
                        {editingRecord ? 'Edit Record' : 'Create New Record'}
                    </h3>
                    <form onSubmit={handleSubmit}>
                        {entitySchema.fields.map(field => renderFormField(field))}
                        <div className="flex justify-end gap-2 mt-6">
                            <Button color="gray" onClick={() => setShowModal(false)}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={submitting}>
                                {submitting ? <Spinner size="sm" /> : editingRecord ? 'Update' : 'Create'}
                            </Button>
                        </div>
                    </form>
                </div>
            </Modal>
        </div>
    );
};

export default EntityContentPage;
