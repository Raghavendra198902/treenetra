# TreeNetra API Reference

## Base URL
```
Development: http://localhost:3000/api/v1
Production: https://api.treenetra.com/api/v1
```

## Authentication

All protected endpoints require a Bearer token:
```
Authorization: Bearer <your-jwt-token>
```

## Quick API Examples

### 1. Register User
```bash
curl -X POST http://localhost:3000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "SecurePass123",
    "fullName": "John Doe"
  }'
```

### 2. Login
```bash
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "SecurePass123"
  }'
```

Response:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGciOiJIUzI1NiIs...",
    "refreshToken": "def50200abc..."
  }
}
```

### 3. Get All Trees
```bash
curl http://localhost:3000/api/v1/trees \
  -H "Authorization: Bearer <token>"
```

### 4. Create Tree
```bash
curl -X POST http://localhost:3000/api/v1/trees \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "speciesId": "6584abc...",
    "location": {
      "latitude": 37.7749,
      "longitude": -122.4194,
      "address": "123 Main St"
    },
    "height": 15.5,
    "diameter": 0.5,
    "status": "healthy"
  }'
```

### 5. Search Trees
```bash
curl "http://localhost:3000/api/v1/trees/search?q=oak&status=healthy" \
  -H "Authorization: Bearer <token>"
```

### 6. Get Nearby Trees
```bash
curl "http://localhost:3000/api/v1/trees/nearby?latitude=37.7749&longitude=-122.4194&radius=1000" \
  -H "Authorization: Bearer <token>"
```

### 7. Create Health Record
```bash
curl -X POST http://localhost:3000/api/v1/health-records \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "treeId": "6584def...",
    "status": "healthy",
    "healthScore": 95,
    "inspectionDate": "2025-11-22",
    "notes": "Tree is in excellent condition"
  }'
```

### 8. Get Analytics Overview
```bash
curl http://localhost:3000/api/v1/analytics/overview \
  -H "Authorization: Bearer <token>"
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

### Paginated Response
```json
{
  "success": true,
  "message": "Trees retrieved successfully",
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8,
    "hasMore": true
  }
}
```

## Status Codes

- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (missing or invalid token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

## Rate Limiting

- **Window**: 15 minutes
- **Max Requests**: 100 per IP
- Headers returned:
  - `X-RateLimit-Limit`: Request limit
  - `X-RateLimit-Remaining`: Remaining requests
  - `X-RateLimit-Reset`: Reset time

## Postman Collection

Import the API collection:
```bash
# Coming soon
curl -o treenetra.postman_collection.json \
  https://api.treenetra.com/postman-collection
```

## Complete API Documentation

For complete endpoint documentation with request/response schemas, see:
- [API Architecture Document](docs/architecture/api-architecture.md)

## Testing with HTTPie

```bash
# Install HTTPie
pip install httpie

# Login
http POST localhost:3000/api/v1/auth/login \
  email=admin@treenetra.com \
  password=Admin@123

# Get trees (with token)
http GET localhost:3000/api/v1/trees \
  Authorization:"Bearer <token>"
```

## JavaScript/Axios Example

```javascript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3000/api/v1',
});

// Login
const { data } = await api.post('/auth/login', {
  email: 'admin@treenetra.com',
  password: 'Admin@123'
});

// Set token for future requests
api.defaults.headers.common['Authorization'] = `Bearer ${data.data.accessToken}`;

// Get trees
const trees = await api.get('/trees');
console.log(trees.data);
```

---

For more examples and detailed documentation, visit [docs/architecture/api-architecture.md](docs/architecture/api-architecture.md)
