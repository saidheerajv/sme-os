import React, { useState } from 'react';
import { Card, TextInput, Button, Select } from 'flowbite-react';
import { HiSearch, HiX } from 'react-icons/hi';
import type { FieldDefinition } from '../types/entity.types';

interface SearchModuleProps {
  fields: FieldDefinition[];
  onSearch: (searchQuery: string) => void;
}

interface SearchField {
  name: string;
  value: string;
  operator: string;
}

// NOTE: Server supports more operators (lk, sw, ew, gt, lt, etc.) but we're starting with 'eq' only
// Additional operators will be implemented in future iterations
const SearchModule: React.FC<SearchModuleProps> = ({ fields, onSearch }) => {
  const [searchFields, setSearchFields] = useState<Record<string, SearchField>>({});

  // Handle field value change
  const handleFieldChange = (fieldName: string, value: string) => {
    setSearchFields(prev => ({
      ...prev,
      [fieldName]: {
        name: fieldName,
        value,
        operator: 'eq', // Using 'eq' operator as default
      },
    }));
  };

  // Build search query string
  const buildSearchQuery = (): string => {
    const queries: string[] = [];
    
    Object.values(searchFields).forEach(field => {
      if (field.value.trim()) {
        const fieldDef = fields.find(f => f.name === field.name);
        
        // Handle boolean fields differently
        if (fieldDef?.type === 'boolean') {
          queries.push(`${field.name}:${field.value}`);
        } else {
          queries.push(`${field.name}:eq${field.value.trim()}`);
        }
      }
    });
    
    return queries.join(';');
  };

  // Handle search submit
  const handleSearch = () => {
    const query = buildSearchQuery();
    onSearch(query);
  };

  // Handle clear search
  const handleClear = () => {
    setSearchFields({});
    onSearch('');
  };

  // Check if any search is active
  const hasActiveSearch = Object.values(searchFields).some(field => field.value.trim());

  return (
    <Card className="mb-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <HiSearch className="w-5 h-5" />
          Search Filters
        </h3>
        {hasActiveSearch && (
          <Button size="sm" color="gray" onClick={handleClear}>
            <HiX className="mr-1 h-4 w-4" />
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
        {fields.map(field => {
          const currentValue = searchFields[field.name]?.value || '';

          return (
            <div key={field.name} className="space-y-2">
              <label htmlFor={`search-${field.name}`} className="block text-sm font-medium text-gray-900">
                {field.displayName || field.name}
              </label>
              
              {/* Value input based on field type */}
              {field.type === 'boolean' ? (
                <Select
                  id={`search-${field.name}`}
                  value={currentValue}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                >
                  <option value="">Select...</option>
                  <option value="true">True</option>
                  <option value="false">False</option>
                </Select>
              ) : field.type === 'date' ? (
                <TextInput
                  id={`search-${field.name}`}
                  type="date"
                  value={currentValue}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                />
              ) : field.type === 'number' ? (
                <TextInput
                  id={`search-${field.name}`}
                  type="number"
                  value={currentValue}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  placeholder={`Search ${field.displayName || field.name}`}
                />
              ) : (
                <TextInput
                  id={`search-${field.name}`}
                  type="text"
                  value={currentValue}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  placeholder={`Search ${field.displayName || field.name}`}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSearch} color="blue">
          <HiSearch className="mr-2 h-5 w-5" />
          Apply Filters
        </Button>
      </div>
    </Card>
  );
};

export default SearchModule;
