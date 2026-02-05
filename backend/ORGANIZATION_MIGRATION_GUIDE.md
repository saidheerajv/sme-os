# Organization Migration Guide

## Overview

The system has been refactored from a **user-centric** architecture to an **organization-centric** multi-tenant architecture.

## Key Changes

### Database Schema Changes

**Before (User-Centric):**
- User → EntityDefinition (one-to-many)
- User → DynamicEntity (one-to-many)
- Entity names were globally unique

**After (Organization-Centric):**
- Organization model added
- OrganizationMember join table (many-to-many: Users ↔ Organizations)
- Organization → EntityDefinition (one-to-many)
- Organization → DynamicEntity (one-to-many)
- Entity names are unique per organization

### API Changes

#### Authorization Header Requirement

All entity and entity-definition endpoints now require:
```
x-organization-id: <organization-uuid>
```

**Affected Endpoints:**
- `GET/POST /entity-definitions`
- `GET/PUT/DELETE /entity-definitions/:name`
- `GET/POST /entities/:entityType`
- `GET/PUT/DELETE /entities/:entityType/:id`

#### New Organization Endpoints

```
GET    /organizations              # List user's organizations
POST   /organizations              # Create new organization
GET    /organizations/:id          # Get organization details
PUT    /organizations/:id          # Update organization
DELETE /organizations/:id          # Delete organization

GET    /organizations/:id/members           # List members
POST   /organizations/:id/members           # Invite member
DELETE /organizations/:id/members/:memberId # Remove member
PUT    /organizations/:id/members/:memberId/role # Update member role
```

### Registration Changes

**signup** endpoint now returns:
```json
{
  "user": {...},
  "defaultOrganization": {
    "id": "org-uuid",
    "name": "User's Organization",
    "slug": "user-org-..."
  },
  "accessToken": "jwt-token"
}
```

A default organization is automatically created for each new user.

## Migration Steps

### For Existing Installation

If you have existing data, follow these steps:

1. **Backup your database**
```bash
pg_dump your_database > backup.sql
```

2. **Run the migration**
```bash
cd backend
npx prisma migrate dev --name add_organization_model
```

3. **Data Migration Script** (if you have existing data)

Create a script to:
- Create a default organization for each existing user
- Move their entity definitions to their organization
- Move their entity data to their organization

Example migration (run after schema migration):
```typescript
// scripts/migrate-to-organizations.ts
const users = await prisma.user.findMany({
  include: {
    entityDefinitions: true,
    dynamicEntities: true,
  },
});

for (const user of users) {
  // Create organization for user
  const org = await prisma.organization.create({
    data: {
      name: `${user.name}'s Organization`,
      slug: `${user.email.split('@')[0]}-org-${Date.now()}`,
      description: 'Migrated organization',
      members: {
        create: {
          userId: user.id,
          role: 'owner',
        },
      },
    },
  });

  // Update entity definitions to reference organization
  await prisma.entityDefinition.updateMany({
    where: { userId: user.id },
    data: { organizationId: org.id },
  });

  // Update dynamic entities to reference organization
  await prisma.dynamicEntity.updateMany({
    where: { userId: user.id },
    data: { organizationId: org.id },
  });
}
```

### For Fresh Installation

No migration needed! Just run:
```bash
cd backend
npx prisma migrate deploy
npx prisma generate
npm run build
npm run start
```

## Testing the Changes

1. **Register a new user**
```bash
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com", "password": "Test123!", "name": "Test User"}'
```

2. **Save the organization ID from response**

3. **Create entity definition with organization context**
```bash
curl -X POST http://localhost:3000/entity-definitions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "x-organization-id: YOUR_ORG_ID" \
  -d '{"name": "Product", "fields": [...]}'
```

4. **Create entities with organization context**
```bash
curl -X POST http://localhost:3000/entities/Product \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "x-organization-id: YOUR_ORG_ID" \
  -d '{"title": "Laptop", "price": 999}'
```

## Benefits of the New Architecture

### Data Isolation
- Complete separation of data between organizations
- No risk of data leakage between tenants
- Organizations can have entities with same names

### Collaboration
- Multiple users can work in same organization
- Role-based access control (owner, admin, member)
- Easy team management

### Scalability
- Better performance with organization-scoped queries
- Easier to implement per-organization features
- Cleaner data model for enterprise use

### Flexibility
- Users can belong to multiple organizations
- Easy to implement organization-level settings
- Foundation for advanced features (billing, limits, etc.)

## Breaking Changes Summary

⚠️ **CLIENT APPLICATIONS MUST BE UPDATED**

1. **Add organization selection UI**
   - Let users choose which organization to work with
   - Store selected organization ID in state/context

2. **Include `x-organization-id` header in all entity requests**
   - EntityDefinition endpoints
   - Entity CRUD endpoints

3. **Handle organization management**
   - Display user's organizations
   - Allow creating new organizations
   - Manage organization members

4. **Update signup/login flow**
   - Handle defaultOrganization in response
   - Set initial organization context

## Support

For questions or issues:
- Check the updated CMS_README.md
- Review the FILTER_API_DOCS.md for query examples
- Test with the curl examples provided above
