import { useMemo, useState } from 'react';
import { Button, Badge } from 'flowbite-react';
import { HiPencil, HiTrash } from 'react-icons/hi';
import type { EntityDefinition } from '../../types/entity.types';
import type { EntityRecord } from '../../services/entities.api';
import type { KanbanConfig } from '../../types/entity.types';

interface KanbanBoardProps {
  data: EntityRecord[];
  schema: EntityDefinition;
  config: KanbanConfig;
  onEdit?: (record: EntityRecord) => void;
  onDelete?: (record: EntityRecord) => void;
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ data, schema, config, onEdit, onDelete }) => {
  // Get the dropdown field that defines the columns
  const groupField = useMemo(() => {
    return schema.fields.find(f => f.name === config.groupByField);
  }, [schema.fields, config.groupByField]);

  // Build columns from the dropdown options
  const columns = useMemo(() => {
    if (!groupField?.options) return [];
    return groupField.options.map(opt => ({
      key: opt.value,
      label: opt.label,
    }));
  }, [groupField]);

  // Group data by column value
  const groupedData = useMemo(() => {
    const groups: Record<string, EntityRecord[]> = {};
    columns.forEach(col => {
      groups[col.key] = [];
    });
    // Add an "Uncategorized" bucket for records without a matching group value
    groups['__uncategorized__'] = [];

    data.forEach(record => {
      const value = record[config.groupByField];
      if (value && groups[value] !== undefined) {
        groups[value].push(record);
      } else {
        groups['__uncategorized__'].push(record);
      }
    });
    return groups;
  }, [data, columns, config.groupByField]);

  // Column colors for visual distinction
  const columnColors = [
    'bg-blue-50 border-blue-200',
    'bg-green-50 border-green-200',
    'bg-yellow-50 border-yellow-200',
    'bg-purple-50 border-purple-200',
    'bg-pink-50 border-pink-200',
    'bg-indigo-50 border-indigo-200',
    'bg-orange-50 border-orange-200',
    'bg-teal-50 border-teal-200',
  ];

  const badgeColors: Array<'info' | 'success' | 'warning' | 'purple' | 'pink' | 'indigo' | 'failure' | 'gray'> = [
    'info', 'success', 'warning', 'purple', 'pink', 'indigo', 'failure', 'gray',
  ];

  const hasUncategorized = groupedData['__uncategorized__']?.length > 0;

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-4 min-w-max">
        {columns.map((col, colIdx) => (
          <div
            key={col.key}
            className={`flex flex-col rounded-lg border ${columnColors[colIdx % columnColors.length]} min-w-[280px] max-w-[320px] w-[300px]`}
          >
            {/* Column Header */}
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <span className="font-semibold text-sm text-gray-700">{col.label}</span>
              <Badge color={badgeColors[colIdx % badgeColors.length]} size="sm">
                {groupedData[col.key]?.length || 0}
              </Badge>
            </div>

            {/* Cards */}
            <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-280px)]">
              {(groupedData[col.key] || []).map(record => (
                <KanbanCard
                  key={record.id}
                  record={record}
                  config={config}
                  schema={schema}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
              {(groupedData[col.key] || []).length === 0 && (
                <div className="text-center text-gray-400 text-xs py-8">
                  No items
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Uncategorized column */}
        {hasUncategorized && (
          <div className="flex flex-col rounded-lg border bg-gray-50 border-gray-200 min-w-[280px] max-w-[320px] w-[300px]">
            <div className="px-4 py-3 border-b flex items-center justify-between">
              <span className="font-semibold text-sm text-gray-500">Uncategorized</span>
              <Badge color="gray" size="sm">
                {groupedData['__uncategorized__'].length}
              </Badge>
            </div>
            <div className="flex-1 p-2 space-y-2 overflow-y-auto max-h-[calc(100vh-280px)]">
              {groupedData['__uncategorized__'].map(record => (
                <KanbanCard
                  key={record.id}
                  record={record}
                  config={config}
                  schema={schema}
                  onEdit={onEdit}
                  onDelete={onDelete}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Individual Kanban Card
interface KanbanCardProps {
  record: EntityRecord;
  config: KanbanConfig;
  schema: EntityDefinition;
  onEdit?: (record: EntityRecord) => void;
  onDelete?: (record: EntityRecord) => void;
}

const KanbanCard: React.FC<KanbanCardProps> = ({ record, config, schema, onEdit, onDelete }) => {
  const [showActions, setShowActions] = useState(false);

  const title = record[config.titleField] || 'Untitled';
  const description = config.descriptionField ? record[config.descriptionField] : null;

  // Show additional fields (excluding title, description, and groupBy fields)
  const extraFields = useMemo(() => {
    return schema.fields.filter(
      f =>
        f.name !== config.titleField &&
        f.name !== config.groupByField &&
        f.name !== config.descriptionField &&
        f.showInDataTable !== false
    );
  }, [schema.fields, config]);

  return (
    <div
      className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onMouseEnter={() => setShowActions(true)}
      onMouseLeave={() => setShowActions(false)}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-medium text-sm text-gray-800 leading-snug flex-1">
          {String(title)}
        </h4>
        {showActions && (onEdit || onDelete) && (
          <div className="flex gap-1 shrink-0">
            {onEdit && (
              <Button size="xs" color="light" onClick={() => onEdit(record)} className="p-0.5">
                <HiPencil className="h-3 w-3" />
              </Button>
            )}
            {onDelete && (
              <Button size="xs" color="failure" onClick={() => onDelete(record)} className="p-0.5">
                <HiTrash className="h-3 w-3" />
              </Button>
            )}
          </div>
        )}
      </div>

      {description && (
        <p className="text-xs text-gray-500 mt-1 line-clamp-2">{String(description)}</p>
      )}

      {/* Show a few extra fields as small badges/details */}
      {extraFields.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1">
          {extraFields.slice(0, 3).map(field => {
            const val = record[field.name];
            if (val === undefined || val === null || val === '') return null;

            let display: string;
            if (field.type === 'boolean') {
              display = val ? '✓' : '✗';
            } else if (field.type === 'date' && val) {
              display = new Date(val as string).toLocaleDateString();
            } else if (field.type === 'datetime' && val) {
              display = new Date(val as string).toLocaleString();
            } else {
              display = String(val);
            }

            return (
              <span
                key={field.name}
                className="inline-flex items-center text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded"
                title={field.displayName || field.name}
              >
                {display.length > 20 ? display.slice(0, 20) + '...' : display}
              </span>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default KanbanBoard;
