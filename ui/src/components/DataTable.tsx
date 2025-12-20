import { useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  flexRender,
} from '@tanstack/react-table';
import type { ColumnDef } from '@tanstack/react-table';
import { Button } from 'flowbite-react';
import { HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import type { EntityDefinition, FieldDefinition } from '../types/entity.types';
import type { EntityRecord } from '../services/entities.api';

interface DataTableProps {
  data: EntityRecord[];
  schema: EntityDefinition;
  onEdit?: (record: EntityRecord) => void;
  onDelete?: (record: EntityRecord) => void;
}

const DataTable: React.FC<DataTableProps> = ({ data, schema, onEdit, onDelete }) => {
  // Create columns from schema

  console.log('Schema in DataTable:', schema, data);

  const columns = useMemo<ColumnDef<EntityRecord>[]>(() => {
    const schemaColumns: ColumnDef<EntityRecord>[] = schema.fields.map((field: FieldDefinition) => ({
      accessorKey: field.name,
      header: field.name.charAt(0).toUpperCase() + field.name.slice(1),
      cell: (info) => {
        const value = info.getValue();
        
        // Format display based on field type
        if (field.type === 'boolean') {
          return value ? '✓' : '✗';
        }
        if (field.type === 'date' && value) {
          return new Date(value as string).toLocaleDateString();
        }
        return value?.toString() || '';
      },
    }));

    // Add actions column if handlers are provided
    if (onEdit || onDelete) {
      schemaColumns.push({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex gap-2">
            {onEdit && (
              <Button size="xs" color="blue" onClick={() => onEdit(row.original)}>
                Edit
              </Button>
            )}
            {onDelete && (
              <Button size="xs" color="failure" onClick={() => onDelete(row.original)}>
                Delete
              </Button>
            )}
          </div>
        ),
      });
    }

    return schemaColumns;
  }, [schema, onEdit, onDelete]);

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    initialState: {
      pagination: {
        pageSize: 10,
      },
    },
  });

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
        <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-6 py-3">
                  {header.isPlaceholder ? null : (
                    <div
                      className={header.column.getCanSort() ? 'cursor-pointer select-none' : ''}
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{
                        asc: ' 🔼',
                        desc: ' 🔽',
                      }[header.column.getIsSorted() as string] ?? null}
                    </div>
                  )}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.map((row) => (
            <tr
              key={row.id}
              className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              {row.getVisibleCells().map((cell) => (
                <td key={cell.id} className="px-6 py-4">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className="flex items-center justify-between px-6 py-4 border-t dark:border-gray-700">
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700 dark:text-gray-400">
            Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
          </span>
          <span className="text-sm text-gray-700 dark:text-gray-400">
            | Total: {data.length} records
          </span>
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            color="gray"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <HiChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            size="sm"
            color="gray"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <HiChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DataTable;
