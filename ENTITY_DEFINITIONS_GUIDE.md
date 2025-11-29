# Entity Definitions Management

A comprehensive interface for creating and managing dynamic entity definitions in your CMS.

## Features

### ✅ Entity Creation
- **Dynamic Entity Definition**: Create entities at runtime with custom field configurations
- **Comprehensive Field Types**: Support for string, number, boolean, email, date, and URL field types
- **Validation Rules**: Configure field-specific validation including required fields, length constraints, and regex patterns
- **Advanced Constraints**: Set minimum/maximum values, unique constraints, and default values

### ✅ User Interface
- **Intuitive Form Builder**: Easy-to-use interface for defining entity structure
- **Real-time Validation**: Immediate feedback on field configuration errors
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Visual Field Management**: Add, remove, and configure fields with visual controls

### ✅ Field Configuration Options
- **Basic Properties**:
  - Field name (required, must be unique within entity)
  - Field type (string, number, boolean, email, date, URL)
  - Required/Optional flag

- **Advanced String Constraints**:
  - Minimum length
  - Maximum length
  - Regex pattern validation
  - Default value

- **Advanced Number Constraints**:
  - Minimum value
  - Maximum value
  - Default value

- **General Options**:
  - Unique constraint
  - Default values for all field types

## How to Use

### Creating a New Entity

1. **Access Entity Definitions**
   - Navigate to Dashboard
   - Click "Manage Entities" button
   - Click "Create Entity" button

2. **Define Entity Structure**
   - Enter a unique entity name (e.g., "Product", "Customer", "Article")
   - Entity names must start with a letter and contain only letters and numbers

3. **Add Fields**
   - Click "Add Field" to create new fields
   - Configure each field:
     - **Name**: Unique field identifier (e.g., "title", "price", "email")
     - **Type**: Select from available field types
     - **Required**: Toggle whether field is mandatory
     - **Advanced**: Click to expand additional options

4. **Configure Advanced Options**
   - **Unique**: Ensure field values are unique across all records
   - **Length Constraints**: Set min/max length for text fields
   - **Value Constraints**: Set min/max values for number fields
   - **Pattern**: Define regex validation for string fields
   - **Default Value**: Set initial field value

5. **Save Entity**
   - Review your configuration
   - Click "Create Entity" to save

### Example Entity Configurations

#### Product Entity
```json
{
  "name": "Product",
  "fields": [
    {
      "name": "title",
      "type": "string",
      "required": true,
      "minLength": 3,
      "maxLength": 100
    },
    {
      "name": "price",
      "type": "number",
      "required": true,
      "min": 0
    },
    {
      "name": "description",
      "type": "string",
      "required": false,
      "maxLength": 500
    },
    {
      "name": "inStock",
      "type": "boolean",
      "required": true,
      "defaultValue": true
    },
    {
      "name": "email",
      "type": "email",
      "required": false
    }
  ]
}
```

#### Customer Entity
```json
{
  "name": "Customer",
  "fields": [
    {
      "name": "firstName",
      "type": "string",
      "required": true,
      "minLength": 2,
      "maxLength": 50
    },
    {
      "name": "lastName", 
      "type": "string",
      "required": true,
      "minLength": 2,
      "maxLength": 50
    },
    {
      "name": "email",
      "type": "email",
      "required": true,
      "unique": true
    },
    {
      "name": "website",
      "type": "url",
      "required": false
    },
    {
      "name": "registrationDate",
      "type": "date",
      "required": true
    }
  ]
}
```

### Managing Existing Entities

#### Viewing Entities
- All entity definitions are displayed as cards
- Each card shows:
  - Entity name and table name
  - Number of fields
  - Field details with types and constraints
  - Creation date

#### Editing Entities
- Click "Edit" button on any entity card
- Modify field configurations
- Add or remove fields
- Update validation rules
- Click "Update Entity" to save changes

#### Deleting Entities
- Click "Delete" button on entity card
- Confirm deletion in dialog
- **Warning**: This will delete all data instances of this entity type

## Validation Features

### Real-time Form Validation
- **Entity Name**: Must be unique and follow naming conventions
- **Field Names**: Must be unique within entity and follow field naming rules
- **Constraint Logic**: Prevents invalid constraint combinations (e.g., min > max)
- **Required Fields**: Ensures at least one field is defined

### Server-side Validation
- Entity definitions are validated on the backend using Zod schemas
- Field type validation ensures data integrity
- Constraint validation prevents invalid configurations
- Unique constraint enforcement at database level

## API Integration

### Automatic API Generation
Once an entity is created, the following APIs are automatically available:

```
POST   /api/entities/{entityType}     - Create new entity instance
GET    /api/entities/{entityType}     - List all entity instances  
GET    /api/entities/{entityType}/{id} - Get specific entity instance
PUT    /api/entities/{entityType}/{id} - Update entity instance
DELETE /api/entities/{entityType}/{id} - Delete entity instance
```

### Entity Definition APIs
```
GET    /api/entity-definitions        - List all entity definitions
GET    /api/entity-definitions/{name} - Get specific entity definition
POST   /api/entity-definitions        - Create new entity definition
DELETE /api/entity-definitions/{name} - Delete entity definition
```

## Technical Implementation

### Frontend Technologies
- **React 19** with TypeScript
- **Material-UI v7** for UI components
- **React Router** for navigation
- **Axios** for API communication

### Backend Integration
- **NestJS** backend with automatic validation
- **Prisma ORM** for database operations
- **Zod** for runtime schema validation
- **PostgreSQL** database with JSON field storage

### Data Flow
1. Entity definitions stored in `EntityDefinition` table
2. Field configurations stored as JSON in `fields` column
3. Validation schemas automatically generated and cached
4. Dynamic entities stored in `DynamicEntity` table with JSON data

## Error Handling

### User-Friendly Messages
- Clear validation error messages
- Field-specific error highlighting
- Success notifications for operations
- Conflict resolution guidance

### Error Types
- **Validation Errors**: Field configuration problems
- **Conflict Errors**: Duplicate entity names
- **Network Errors**: API communication issues
- **Server Errors**: Backend processing problems

## Next Steps

After creating entity definitions:

1. **Content Management**: Use the generated APIs to create and manage entity instances
2. **Custom Views**: Build specialized interfaces for different entity types
3. **Relationships**: Extend entities with foreign key relationships
4. **Permissions**: Add role-based access control for entities
5. **Webhooks**: Set up notifications for entity events
6. **Analytics**: Track entity usage and performance metrics

---

This entity definitions system provides a foundation for building flexible, scalable content management solutions with runtime entity creation and comprehensive validation.