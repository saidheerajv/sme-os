import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Button, Spinner, Alert } from 'flowbite-react';
import { entityDefinitionsApi } from '../services/entityDefinitions.api';
import { entitiesApi, type EntityRecord } from '../services/entities.api';
import type { EntityDefinition } from '../types/entity.types';
import { HiPlus } from 'react-icons/hi';
import DataTable from './DataTable';
import EntityRecordForm from './EntityRecordForm';

const EntityContentPage: React.FC = () => {

    const { entityName } = useParams<{ entityName: string }>();
    const [entitySchema, setEntitySchema] = useState<EntityDefinition | null>(null);
    const [entityData, setEntityData] = useState<EntityRecord[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [editingRecord, setEditingRecord] = useState<EntityRecord | null>(null);
    const [formData, setFormData] = useState<Record<string, any>>({});

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



    const handleSubmit = async (submittedFormData: Record<string, any>) => {
        if (!entityName) return;

        try {
            if (editingRecord) {
                const updated = await entitiesApi.update(entityName, editingRecord.id, submittedFormData);
                setEntityData(prev => prev.map(item => item.id === editingRecord.id ? updated : item));
            } else {
                await entitiesApi.create(entityName, submittedFormData);
                // Refresh data after creation
                const data: any = await entitiesApi.getAll(entityName);
                setEntityData(data.data.map((item: any) => item.data));
            }
            setShowModal(false);
            setFormData({});
        } catch (err: any) {
            alert(err.response?.data?.message || 'Failed to save record');
            throw err; // Re-throw to let form handle loading state
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
            <EntityRecordForm
                show={showModal}
                onClose={() => setShowModal(false)}
                onSubmit={handleSubmit}
                entitySchema={entitySchema}
                editingRecord={editingRecord}
                initialData={formData}
            />
        </div>
    );
};

export default EntityContentPage;