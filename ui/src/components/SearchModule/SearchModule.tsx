import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Card, TextInput, Button, Select } from 'flowbite-react';
import { HiX } from 'react-icons/hi';
import debounce from 'lodash/debounce';
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

// NOTE: Server supports more operators (lk, sw, ew, gt, lt, etc.) but we're using 'lk' (like) as default
// Additional operators will be implemented in future iterations
const SearchModule: React.FC<SearchModuleProps> = ({ fields, onSearch }) => {
  const [searchFields, setSearchFields] = useState<Record<string, SearchField>>({});

  // Build search query string
  const buildSearchQuery = (fieldsData: Record<string, SearchField>): string => {
    const queries: string[] = [];
    
    Object.values(fieldsData).forEach(field => {
      if (field.value.trim()) {
        const fieldDef = fields.find(f => f.name === field.name);
        
        // Handle boolean fields differently
        if (fieldDef?.type === 'boolean') {
          queries.push(`${field.name}:${field.value}`);
        } else {
          queries.push(`${field.name}:lk${field.value.trim()}`);
        }
      }
    });
    
    return queries.join(';');
  };

  // Create debounced search function
  const debouncedSearch = useRef(
    debounce((fieldsData: Record<string, SearchField>) => {
      const query = buildSearchQuery(fieldsData);
      onSearch(query);
    }, 500)
  ).current;

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      debouncedSearch.cancel();
    };
  }, [debouncedSearch]);

  // Handle field value change
  const handleFieldChange = useCallback((fieldName: string, value: string) => {
    setSearchFields(prev => {
      const updated = {
        ...prev,
        [fieldName]: {
          name: fieldName,
          value,
          operator: 'lk', // Using 'lk' (like) operator as default
        },
      };
      
      // Automatically trigger debounced search
      debouncedSearch(updated);
      
      return updated;
    });
  }, [debouncedSearch]);

  // Handle clear search
  const handleClear = useCallback(() => {
    setSearchFields({});
    debouncedSearch.cancel(); // Cancel any pending debounced calls
    onSearch('');
  }, [debouncedSearch, onSearch]);

  // Check if any search is active
  const hasActiveSearch = Object.values(searchFields).some(field => field.value.trim());

  // Limit to first 4 fields
  const displayFields = fields.slice(0, 4);

  return (
    <Card className="mb-4 py-2">
      <div className="grid grid-cols-4 gap-2 items-center">
        {displayFields.map(field => {
          const currentValue = searchFields[field.name]?.value || '';

          return (
            <div key={field.name}>
              {field.type === 'boolean' ? (
                <Select
                  id={`search-${field.name}`}
                  value={currentValue}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  sizing="sm"
                >
                  <option value="">{field.displayName || field.name}</option>
                  <option value="true">True</option>
                  <option value="false">False</option>
                </Select>
              ) : field.type === 'date' ? (
                <TextInput
                  id={`search-${field.name}`}
                  type="date"
                  value={currentValue}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  placeholder={field.displayName || field.name}
                  sizing="sm"
                />
              ) : field.type === 'number' ? (
                <TextInput
                  id={`search-${field.name}`}
                  type="number"
                  value={currentValue}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  placeholder={field.displayName || field.name}
                  sizing="sm"
                />
              ) : (
                <TextInput
                  id={`search-${field.name}`}
                  type="text"
                  value={currentValue}
                  onChange={(e) => handleFieldChange(field.name, e.target.value)}
                  placeholder={field.displayName || field.name}
                  sizing="sm"
                />
              )}
            </div>
          );
        })}
        {hasActiveSearch && (
          <Button size="xs" color="gray" onClick={handleClear} className="ml-auto">
            <HiX className="h-4 w-4" />
          </Button>
        )}
      </div>
    </Card>
  );
};

SearchModule.displayName = 'SearchModule';

// Custom comparison function to prevent re-renders when fields haven't actually changed
const arePropsEqual = (prevProps: SearchModuleProps, nextProps: SearchModuleProps) => {
  // Check if fields array is the same or has the same content
  if (prevProps.fields.length !== nextProps.fields.length) return false;
  
  const fieldsEqual = prevProps.fields.every((field, index) => 
    field.name === nextProps.fields[index]?.name &&
    field.type === nextProps.fields[index]?.type &&
    field.displayName === nextProps.fields[index]?.displayName
  );
  
  return fieldsEqual;
};

export default React.memo(SearchModule, arePropsEqual);
