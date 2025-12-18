import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { Card, Button, Modal, TextInput, Label, Checkbox, Spinner, Alert } from 'flowbite-react';
import {
  useReactTable,
  getCoreRowModel,
  flexRender,
  createColumnHelper,
  type ColumnDef,
} from '@tanstack/react-table';
import { entityDefinitionsApi } from '../services/entityDefinitions.api';
import { entitiesApi, type EntityRecord } from '../services/entities.api';
import type { EntityDefinition, FieldDefinition } from '../types/entity.types';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi';

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
                const [schema, data] = await Promise.all([
                    entityDefinitionsApi.getByName(entityName),
                    entitiesApi.getAll(entityName)
                ]);
                setEntitySchema(schema);
                setEntityData(data);
            } catch (err: any) {
                setError(err.response?.data?.message || 'Failed to load entity data');
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [entityName]);

    // Generate table columns from schema
    const columns = useMemo<ColumnDef<EntityRecord, any>[]>(() => {
        if (!entitySchema) return [];

        const columnHelper = createColumnHelper<EntityRecord>();
        
        const fieldColumns = entitySchema.fields.map(field =>
            columnHelper.accessor(field.name, {
                header: field.name.charAt(0).toUpperCase() + field.name.slice(1),
                cell: info => formatCellValue(info.getValue(), field.type),
            })
        );

        const actionsColumn = columnHelper.display({
            id: 'actions',
            header: 'Actions',
            cell: props => (
                <div className="flex gap-2">
                    <Button size="xs" color="light" onClick={() => handleEdit(props.row.original)}>
                        <HiPencil className="h-4 w-4" />
                    </Button>
                    <Button size="xs" color="failure" onClick={() => handleDelete(props.row.original.id)}>
                        <HiTrash className="h-4 w-4" />
                    </Button>
                </div>
            ),
        });

        return [...fieldColumns, actionsColumn];
    }, [entitySchema]);

    const table = useReactTable({
        data: entityData,
        columns,
        getCoreRowModel: getCoreRowModel(),
    });

    // Format cell values based on field type
    const formatCellValue = (value: any, type: string) => {
        if (value === null || value === undefined) return '-';
        
        switch (type) {
            case 'boolean':
                return value ? '✓' : '✗';
            case 'date':
                return new Date(value).toLocaleDateString();
            case 'url':
                return <a href={value} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{value}</a>;
            default:
                return String(value);
        }
    };

    // Handle create/edit modal
    const handleCreate = () => {
        setEditingRecord(null);
        setFormData({});
        setShowModal(true);
    };

    const handleEdit = (record: EntityRecord) => {
        setEditingRecord(record);
        const { id, userId, createdAt, updatedAt, ...formDataCopy } = record;
        setFormData(formDataCopy);
        setShowModal(true);
    };

    const handleDelete = async (id: string) => {
        if (!entityName || !confirm('Are you sure you want to delete this record?')) return;
        
        try {
            await entitiesApi.delete(entityName, id);
            setEntityData(prev => prev.filter(item => item.id !== id));
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
                const created = await entitiesApi.create(entityName, formData);
                setEntityData(prev => [...prev, created]);
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
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-gray-500">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                                {table.getHeaderGroups().map(headerGroup => (
                                    <tr key={headerGroup.id}>
                                        {headerGroup.headers.map(header => (
                                            <th key={header.id} scope="col" className="px-6 py-3">
                                                {header.isPlaceholder
                                                    ? null
                                                    : flexRender(
                                                        header.column.columnDef.header,
                                                        header.getContext()
                                                    )}
                                            </th>
                                        ))}
                                    </tr>
                                ))}
                            </thead>
                            <tbody>
                                {table.getRowModel().rows.map(row => (
                                    <tr key={row.id} className="bg-white border-b hover:bg-gray-50">
                                        {row.getVisibleCells().map(cell => (
                                            <td key={cell.id} className="px-6 py-4">
                                                {flexRender(
                                                    cell.column.columnDef.cell,
                                                    cell.getContext()
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>

            {/* Create/Edit Modal */}
            <Modal show={showModal} onClose={() => setShowModal(false)}>
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
