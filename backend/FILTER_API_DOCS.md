# Entity Filtering API Documentation

This document describes the filtering capabilities for the dynamic entity API.

## Overview

The filtering system allows you to query entities using various operators in the query parameters. The system supports filtering, sorting, pagination, and field selection.

## Basic Usage

### GET All Entities with Filters
```
GET /entities/{entityType}?search={filters}&sort={field:direction}&page={number}&limit={number}&select={fields}
```

## Filter Syntax

Filters are specified in the `search` query parameter using the following format:
```
field:operatorValue;field2:operatorValue2
```

Multiple filters are separated by semicolons (`;`).

## Supported Operators

### String Operators
| Operator | Syntax | Description | Example |
|----------|--------|-------------|---------|
| `eq` (equals) | `field:eqValue` | Exact match | `name:eqJohn` |
| `ne` (not equals) | `field:neValue` | Not equal to | `name:neJohn` |
| `lk` (like) | `field:lkValue` | Contains (case-insensitive) | `name:lkTest` |
| `sw` (starts with) | `field:swValue` | Starts with (case-insensitive) | `name:swJo` |
| `ew` (ends with) | `field:ewValue` | Ends with (case-insensitive) | `name:ewhn` |

### Number/Date Operators
| Operator | Syntax | Description | Example |
|----------|--------|-------------|---------|
| `lt` (less than) | `field:ltValue` | Less than | `price:lt100` |
| `lte` (less than equal) | `field:lteValue` | Less than or equal | `price:lte100` |
| `gt` (greater than) | `field:gtValue` | Greater than | `price:gt50` |
| `gte` (greater than equal) | `field:gteValue` | Greater than or equal | `price:gte50` |

### Array Operators
| Operator | Syntax | Description | Example |
|----------|--------|-------------|---------|
| `in` | `field:in[val1,val2,val3]` | Value in list | `status:in[active,pending]` |
| `nin` (not in) | `field:nin[val1,val2,val3]` | Value not in list | `status:nin[inactive,deleted]` |

### Boolean Operators
| Operator | Syntax | Description | Example |
|----------|--------|-------------|---------|
| `true` | `field:true` | Field is true | `active:true` |
| `false` | `field:false` | Field is false | `active:false` |

### Null Operators
| Operator | Syntax | Description | Example |
|----------|--------|-------------|---------|
| `null` | `field:null` | Field is null/undefined | `description:null` |
| `notnull` | `field:notnull` | Field is not null | `description:notnull` |

## Examples

### Product Entity Examples

Assuming you have a Product entity with fields: `name`, `price`, `category`, `active`, `description`

#### Basic Filtering
```bash
# Products with name containing "laptop"
GET /entities/product?search=name:lklaptop

# Products with price less than 1000
GET /entities/product?search=price:lt1000

# Active products only
GET /entities/product?search=active:true

# Products in specific categories
GET /entities/product?search=category:in[electronics,computers]
```

#### Complex Filtering (Multiple Conditions)
```bash
# Active laptops under $1500
GET /entities/product?search=name:lklaptop;price:lt1500;active:true

# Products NOT in discontinued categories, with prices between 100-500
GET /entities/product?search=category:nin[discontinued,obsolete];price:gte100;price:lte500

# Products with names starting with "Mac" and not null descriptions
GET /entities/product?search=name:swMac;description:notnull
```

### Sorting

Sort by field in ascending or descending order:
```bash
# Sort by price ascending
GET /entities/product?sort=price:asc

# Sort by name descending
GET /entities/product?sort=name:desc

# Combine with filters
GET /entities/product?search=active:true&sort=price:asc
```

### Pagination

Control the number of results returned:
```bash
# Get first 10 products
GET /entities/product?page=1&limit=10

# Get next 10 products
GET /entities/product?page=2&limit=10

# Combine with filters and sorting
GET /entities/product?search=active:true&sort=price:asc&page=1&limit=20
```

### Field Selection

Return only specific fields:
```bash
# Return only name and price
GET /entities/product?select=name,price

# Combine with filters
GET /entities/product?search=active:true&select=name,price,category
```

### Complete Example

```bash
# Get active products with "laptop" in name, 
# priced between $500-$2000, 
# sorted by price ascending,
# return only name, price, and category fields,
# paginated (first 10 results)
GET /entities/product?search=name:lklaptop;active:true;price:gte500;price:lte2000&sort=price:asc&select=name,price,category&page=1&limit=10
```

## Response Format

### Success Response
```json
{
  "data": [
    {
      "id": "uuid",
      "entityType": "product",
      "userId": "user-uuid",
      "data": {
        "name": "MacBook Pro",
        "price": 1299,
        "category": "laptops"
      },
      "createdAt": "2023-10-28T10:00:00Z",
      "updatedAt": "2023-10-28T10:00:00Z"
    }
  ],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "totalPages": 15,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### Error Response
```json
{
  "statusCode": 400,
  "message": "Unknown field: invalidField",
  "error": "Bad Request"
}
```

## Field Type Support

Different operators are supported based on field types:

### String Fields (string, email, url)
- `eq`, `ne`, `lk`, `sw`, `ew`, `in`, `nin`, `null`, `notnull`

### Number Fields
- `eq`, `ne`, `lt`, `lte`, `gt`, `gte`, `in`, `nin`, `null`, `notnull`

### Boolean Fields
- `eq`, `ne`, `true`, `false`, `null`, `notnull`

### Date Fields
- `eq`, `ne`, `lt`, `lte`, `gt`, `gte`, `in`, `nin`, `null`, `notnull`

## Limitations

1. Maximum 100 items per page
2. Operators are validated against field types
3. Unknown fields will result in validation errors
4. Array operator values are comma-separated without spaces in brackets

## Error Handling

The API will return appropriate error messages for:
- Invalid filter syntax
- Unknown fields
- Unsupported operators for field types
- Invalid sort directions
- Invalid pagination parameters