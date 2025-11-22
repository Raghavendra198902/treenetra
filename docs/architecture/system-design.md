# System Design Document

## Table of Contents

- [Introduction](#introduction)
- [System Requirements](#system-requirements)
- [Design Principles](#design-principles)
- [Component Design](#component-design)
- [Integration Patterns](#integration-patterns)
- [Error Handling](#error-handling)
- [Performance Considerations](#performance-considerations)

## Introduction

This document details the system design for TreeNetra, covering functional requirements, technical decisions, and implementation guidelines.

### Objectives

- **Reliability**: 99.9% uptime
- **Scalability**: Handle 10,000+ concurrent users
- **Performance**: API response time < 200ms (p95)
- **Security**: Enterprise-grade security measures
- **Maintainability**: Clean, modular, well-documented code

## System Requirements

### Functional Requirements

#### FR1: Tree Management
- Users can create, read, update, and delete tree records
- Support for bulk import/export
- Image upload and management
- GPS location tracking
- Tree categorization and tagging

#### FR2: Health Monitoring
- Track tree health metrics over time
- Disease detection and alerts
- Growth pattern visualization
- Maintenance scheduling
- Historical health data

#### FR3: User Management
- User registration and authentication
- Role-based access control (RBAC)
- Profile management
- Activity logging

#### FR4: Analytics and Reporting
- Statistical dashboards
- Custom report generation
- Data export (CSV, PDF, Excel)
- Trend analysis
- Predictive analytics

#### FR5: Notifications
- Email notifications
- SMS alerts
- Push notifications
- In-app messaging

#### FR6: Search and Filter
- Full-text search
- Advanced filtering
- Geospatial search
- Autocomplete suggestions

### Non-Functional Requirements

#### NFR1: Performance
- API response time: < 200ms (p95)
- Page load time: < 2 seconds
- Database query time: < 100ms
- Concurrent users: 10,000+

#### NFR2: Scalability
- Horizontal scaling capability
- Auto-scaling based on load
- Database sharding support
- CDN for global distribution

#### NFR3: Availability
- 99.9% uptime SLA
- Zero-downtime deployments
- Disaster recovery plan
- Automated failover

#### NFR4: Security
- HTTPS/TLS encryption
- JWT authentication
- Input validation and sanitization
- SQL injection prevention
- XSS protection
- CSRF protection
- Rate limiting

#### NFR5: Maintainability
- Clean code architecture
- Comprehensive documentation
- Automated testing (>80% coverage)
- CI/CD pipeline
- Monitoring and logging

## Design Principles

### 1. SOLID Principles

**Single Responsibility Principle (SRP)**
```javascript
// Good: Each class has one responsibility
class TreeRepository {
  async findById(id) { /* ... */ }
  async save(tree) { /* ... */ }
}

class TreeValidator {
  validate(tree) { /* ... */ }
}

class TreeService {
  constructor(repository, validator) {
    this.repository = repository;
    this.validator = validator;
  }
}
```

**Open/Closed Principle (OCP)**
```javascript
// Base class open for extension
class NotificationStrategy {
  async send(message) {
    throw new Error('Must implement send method');
  }
}

// Closed for modification, extended for new types
class EmailNotification extends NotificationStrategy {
  async send(message) { /* ... */ }
}

class SMSNotification extends NotificationStrategy {
  async send(message) { /* ... */ }
}
```

### 2. Separation of Concerns

```
┌─────────────────────────────────────────┐
│         Presentation Layer              │
│  (Controllers, Routes, Middleware)      │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│         Business Logic Layer            │
│         (Services, Domain Logic)        │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│         Data Access Layer               │
│    (Repositories, Models, Queries)      │
└────────────────┬────────────────────────┘
                 │
┌────────────────▼────────────────────────┐
│            Database                      │
└──────────────────────────────────────────┘
```

### 3. Dependency Injection

```javascript
// Container setup
class Container {
  constructor() {
    this.services = {};
  }

  register(name, factory) {
    this.services[name] = factory(this);
  }

  get(name) {
    return this.services[name];
  }
}

// Usage
const container = new Container();

container.register('treeRepository', () => new TreeRepository());
container.register('treeValidator', () => new TreeValidator());
container.register('treeService', (c) => 
  new TreeService(c.get('treeRepository'), c.get('treeValidator'))
);
```

## Component Design

### 1. Tree Management Component

#### Architecture

```
┌──────────────────────────────────────────────┐
│              Tree Controller                 │
│  - Input validation                          │
│  - Request/response handling                 │
└────────────────┬─────────────────────────────┘
                 │
┌────────────────▼─────────────────────────────┐
│              Tree Service                    │
│  - Business logic                            │
│  - Orchestration                             │
│  - Transaction management                    │
└────┬────────────────────────┬────────────────┘
     │                        │
┌────▼──────────┐    ┌───────▼──────────┐
│ Tree Repo     │    │  Image Service   │
│ - CRUD ops    │    │  - Upload        │
│ - Queries     │    │  - Resize        │
└───────────────┘    └──────────────────┘
```

#### Data Model

```javascript
// Domain Model
class Tree {
  constructor({
    id,
    species,
    commonName,
    scientificName,
    location,
    plantedDate,
    height,
    diameter,
    healthStatus,
    images,
    tags,
    createdAt,
    updatedAt
  }) {
    this.id = id;
    this.species = species;
    this.commonName = commonName;
    this.scientificName = scientificName;
    this.location = location; // { lat, lng, address }
    this.plantedDate = plantedDate;
    this.height = height;
    this.diameter = diameter;
    this.healthStatus = healthStatus; // healthy, needs_attention, critical
    this.images = images || [];
    this.tags = tags || [];
    this.createdAt = createdAt;
    this.updatedAt = updatedAt;
  }

  isHealthy() {
    return this.healthStatus === 'healthy';
  }

  needsAttention() {
    return this.healthStatus === 'needs_attention' || 
           this.healthStatus === 'critical';
  }

  age() {
    return new Date().getFullYear() - 
           new Date(this.plantedDate).getFullYear();
  }
}
```

#### Service Layer

```javascript
class TreeService {
  constructor(repository, validator, imageService, eventBus) {
    this.repository = repository;
    this.validator = validator;
    this.imageService = imageService;
    this.eventBus = eventBus;
  }

  async createTree(data) {
    // Validate input
    const validation = this.validator.validate(data);
    if (!validation.valid) {
      throw new ValidationError(validation.errors);
    }

    // Create tree entity
    const tree = new Tree(data);

    // Handle image uploads
    if (data.images && data.images.length > 0) {
      tree.images = await this.imageService.uploadMultiple(data.images);
    }

    // Save to database
    const savedTree = await this.repository.save(tree);

    // Emit event
    await this.eventBus.emit('tree.created', savedTree);

    return savedTree;
  }

  async updateTree(id, updates) {
    const tree = await this.repository.findById(id);
    if (!tree) {
      throw new NotFoundError(`Tree with id ${id} not found`);
    }

    // Validate updates
    const validation = this.validator.validate(updates, { partial: true });
    if (!validation.valid) {
      throw new ValidationError(validation.errors);
    }

    // Apply updates
    Object.assign(tree, updates);
    tree.updatedAt = new Date();

    // Save
    const updated = await this.repository.save(tree);

    // Emit event
    await this.eventBus.emit('tree.updated', updated);

    return updated;
  }

  async deleteTree(id) {
    const tree = await this.repository.findById(id);
    if (!tree) {
      throw new NotFoundError(`Tree with id ${id} not found`);
    }

    // Delete images
    if (tree.images.length > 0) {
      await this.imageService.deleteMultiple(tree.images);
    }

    // Delete from database
    await this.repository.delete(id);

    // Emit event
    await this.eventBus.emit('tree.deleted', { id });
  }

  async searchTrees(criteria) {
    return await this.repository.search(criteria);
  }
}
```

### 2. Authentication Component

#### JWT Token Flow

```
1. User submits credentials
   ↓
2. Validate credentials
   ↓
3. Generate JWT token
   - Header: Algorithm & Type
   - Payload: User info & claims
   - Signature: Secret-based signing
   ↓
4. Return token to client
   ↓
5. Client includes token in requests
   - Header: Authorization: Bearer <token>
   ↓
6. Server validates token
   - Verify signature
   - Check expiration
   - Extract user info
   ↓
7. Process request with user context
```

#### Implementation

```javascript
class AuthService {
  constructor(userRepository, tokenService, passwordService) {
    this.userRepository = userRepository;
    this.tokenService = tokenService;
    this.passwordService = passwordService;
  }

  async login(email, password) {
    // Find user
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Verify password
    const isValid = await this.passwordService.verify(
      password, 
      user.passwordHash
    );
    if (!isValid) {
      throw new AuthenticationError('Invalid credentials');
    }

    // Generate tokens
    const accessToken = this.tokenService.generateAccessToken(user);
    const refreshToken = this.tokenService.generateRefreshToken(user);

    // Store refresh token
    await this.tokenService.storeRefreshToken(user.id, refreshToken);

    return {
      accessToken,
      refreshToken,
      user: this.sanitizeUser(user)
    };
  }

  async refreshToken(refreshToken) {
    // Validate refresh token
    const payload = this.tokenService.verifyRefreshToken(refreshToken);
    
    // Check if token is stored
    const isValid = await this.tokenService.validateRefreshToken(
      payload.userId, 
      refreshToken
    );
    if (!isValid) {
      throw new AuthenticationError('Invalid refresh token');
    }

    // Get user
    const user = await this.userRepository.findById(payload.userId);
    
    // Generate new access token
    const accessToken = this.tokenService.generateAccessToken(user);

    return { accessToken };
  }

  sanitizeUser(user) {
    const { passwordHash, ...safeUser } = user;
    return safeUser;
  }
}
```

### 3. Analytics Component

#### Data Processing Pipeline

```
Raw Data → Validation → Transformation → Aggregation → Storage → Visualization
```

#### Implementation

```javascript
class AnalyticsService {
  constructor(treeRepository, cacheService) {
    this.treeRepository = treeRepository;
    this.cacheService = cacheService;
  }

  async getTreeStatistics() {
    // Try cache first
    const cached = await this.cacheService.get('tree:stats');
    if (cached) return cached;

    // Calculate statistics
    const stats = {
      total: await this.treeRepository.count(),
      byHealth: await this.treeRepository.countByHealth(),
      bySpecies: await this.treeRepository.countBySpecies(),
      averageAge: await this.calculateAverageAge(),
      recentlyAdded: await this.treeRepository.countRecentlyAdded(30)
    };

    // Cache for 5 minutes
    await this.cacheService.set('tree:stats', stats, 300);

    return stats;
  }

  async getHealthTrends(period = '30d') {
    const trends = await this.treeRepository.getHealthTrends(period);
    return this.transformTrendsData(trends);
  }

  async generateReport(type, filters) {
    const data = await this.fetchReportData(type, filters);
    return {
      type,
      generatedAt: new Date(),
      data,
      summary: this.calculateSummary(data)
    };
  }

  private async calculateAverageAge() {
    const trees = await this.treeRepository.findAll();
    const ages = trees.map(tree => tree.age());
    return ages.reduce((sum, age) => sum + age, 0) / ages.length;
  }
}
```

## Integration Patterns

### 1. Event-Driven Architecture

```javascript
class EventBus {
  constructor() {
    this.subscribers = {};
  }

  subscribe(event, handler) {
    if (!this.subscribers[event]) {
      this.subscribers[event] = [];
    }
    this.subscribers[event].push(handler);
  }

  async emit(event, data) {
    const handlers = this.subscribers[event] || [];
    await Promise.all(handlers.map(handler => handler(data)));
  }
}

// Usage
eventBus.subscribe('tree.created', async (tree) => {
  await notificationService.notify({
    type: 'tree_created',
    data: tree
  });
});

eventBus.subscribe('tree.health.critical', async (tree) => {
  await alertService.sendAlert({
    severity: 'high',
    message: `Tree ${tree.id} requires immediate attention`
  });
});
```

### 2. API Integration Pattern

```javascript
class ExternalApiClient {
  constructor(baseUrl, apiKey) {
    this.baseUrl = baseUrl;
    this.apiKey = apiKey;
    this.retryConfig = {
      maxRetries: 3,
      backoff: 1000
    };
  }

  async request(endpoint, options = {}) {
    let attempt = 0;
    
    while (attempt < this.retryConfig.maxRetries) {
      try {
        const response = await fetch(`${this.baseUrl}${endpoint}`, {
          ...options,
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json',
            ...options.headers
          }
        });

        if (!response.ok) {
          throw new ApiError(response.status, await response.text());
        }

        return await response.json();
      } catch (error) {
        attempt++;
        if (attempt >= this.retryConfig.maxRetries) {
          throw error;
        }
        await this.wait(this.retryConfig.backoff * attempt);
      }
    }
  }

  async wait(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
```

## Error Handling

### Error Hierarchy

```javascript
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
  }
}

class ValidationError extends AppError {
  constructor(errors) {
    super('Validation failed', 400, 'VALIDATION_ERROR');
    this.errors = errors;
  }
}

class NotFoundError extends AppError {
  constructor(resource) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

class AuthenticationError extends AppError {
  constructor(message = 'Authentication failed') {
    super(message, 401, 'AUTHENTICATION_ERROR');
  }
}

class AuthorizationError extends AppError {
  constructor(message = 'Insufficient permissions') {
    super(message, 403, 'AUTHORIZATION_ERROR');
  }
}
```

### Global Error Handler

```javascript
const errorHandler = (err, req, res, next) => {
  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    userId: req.user?.id
  });

  // Operational errors
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      error: {
        code: err.code,
        message: err.message,
        ...(err.errors && { errors: err.errors })
      }
    });
  }

  // Programming errors
  return res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred'
    }
  });
};
```

## Performance Considerations

### 1. Database Query Optimization

```javascript
// Bad: N+1 query problem
async function getTreesWithImages() {
  const trees = await Tree.findAll();
  for (const tree of trees) {
    tree.images = await Image.findByTreeId(tree.id);
  }
  return trees;
}

// Good: Use eager loading
async function getTreesWithImages() {
  return await Tree.findAll({
    include: ['images']
  });
}
```

### 2. Caching Strategy

```javascript
class CacheService {
  constructor(redis) {
    this.redis = redis;
  }

  async get(key) {
    const cached = await this.redis.get(key);
    return cached ? JSON.parse(cached) : null;
  }

  async set(key, value, ttl = 3600) {
    await this.redis.setex(key, ttl, JSON.stringify(value));
  }

  async invalidate(pattern) {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}

// Usage with cache-aside pattern
async function getTree(id) {
  const cacheKey = `tree:${id}`;
  
  // Try cache
  let tree = await cacheService.get(cacheKey);
  if (tree) return tree;
  
  // Query database
  tree = await treeRepository.findById(id);
  
  // Store in cache
  await cacheService.set(cacheKey, tree, 3600);
  
  return tree;
}
```

### 3. Pagination

```javascript
async function listTrees(page = 1, limit = 20) {
  const offset = (page - 1) * limit;
  
  const [trees, total] = await Promise.all([
    Tree.findAll({ 
      limit, 
      offset,
      order: [['createdAt', 'DESC']]
    }),
    Tree.count()
  ]);

  return {
    data: trees,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1
    }
  };
}
```

---

**Document Version**: 1.0  
**Last Updated**: November 22, 2025  
**Author**: TreeNetra Team
