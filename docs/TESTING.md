# Testing Guide

Comprehensive guide for testing TreeNetra application.

## Table of Contents

- [Testing Philosophy](#testing-philosophy)
- [Testing Stack](#testing-stack)
- [Test Structure](#test-structure)
- [Unit Testing](#unit-testing)
- [Integration Testing](#integration-testing)
- [End-to-End Testing](#end-to-end-testing)
- [API Testing](#api-testing)
- [Frontend Testing](#frontend-testing)
- [Test Coverage](#test-coverage)
- [Best Practices](#best-practices)
- [CI/CD Testing](#cicd-testing)

## Testing Philosophy

### Testing Pyramid

```
     ╱╲
    ╱E2E╲         Few - Slow - High Confidence
   ╱──────╲
  ╱Integra╲       Some - Medium - Medium Confidence
 ╱tion Tests╲
╱────────────╲
│ Unit Tests │    Many - Fast - Low Confidence
└────────────┘
```

**Our Approach:**
- 70% Unit Tests - Fast, isolated tests
- 20% Integration Tests - Component interaction tests
- 10% E2E Tests - Full user workflow tests

### Goals

- ✅ Catch bugs early
- ✅ Enable safe refactoring
- ✅ Document expected behavior
- ✅ Improve code quality
- ✅ Build confidence in deployments

## Testing Stack

| Layer | Tool | Purpose |
|-------|------|---------|
| Test Runner | Jest | Execute tests, assertions |
| Mocking | Jest | Mock functions, modules |
| API Testing | Supertest | HTTP assertions |
| E2E Testing | Playwright | Browser automation |
| Coverage | Jest | Code coverage reports |
| Frontend | React Testing Library | Component testing |

### Installation

```bash
# Core testing dependencies (already included)
npm install --save-dev \
  jest \
  @jest/globals \
  supertest \
  @playwright/test \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event
```

## Test Structure

### Directory Layout

```
tests/
├── unit/                       # Unit tests
│   ├── services/
│   │   ├── auth.service.test.js
│   │   ├── tree.service.test.js
│   │   └── user.service.test.js
│   ├── models/
│   │   └── tree.model.test.js
│   └── utils/
│       └── validation.test.js
├── integration/                # Integration tests
│   ├── api/
│   │   ├── auth.test.js
│   │   ├── trees.test.js
│   │   └── users.test.js
│   └── database/
│       └── connection.test.js
├── e2e/                       # End-to-end tests
│   ├── auth.spec.js
│   ├── trees.spec.js
│   └── dashboard.spec.js
├── fixtures/                  # Test data
│   ├── users.json
│   └── trees.json
├── helpers/                   # Test utilities
│   ├── db-helper.js
│   └── api-helper.js
└── setup.js                   # Test setup
```

### Naming Conventions

```bash
# Unit tests: [name].test.js
auth.service.test.js
tree.model.test.js

# Integration tests: [feature].test.js
auth.test.js
trees.test.js

# E2E tests: [feature].spec.js
login.spec.js
create-tree.spec.js
```

## Unit Testing

### Service Tests

**Example: Testing Tree Service**

```javascript
// tests/unit/services/tree.service.test.js
import { jest } from '@jest/globals';
import TreeService from '../../../src/services/tree.service.js';
import Tree from '../../../src/models/tree.model.js';
import { ApiError } from '../../../src/utils/apiError.js';

describe('TreeService', () => {
  let treeService;

  beforeEach(() => {
    treeService = new TreeService();
    jest.clearAllMocks();
  });

  describe('createTree', () => {
    it('should create a tree successfully', async () => {
      const treeData = {
        speciesId: '507f1f77bcf86cd799439011',
        location: {
          latitude: 37.7749,
          longitude: -122.4194,
          address: '123 Main St'
        },
        height: 15.5,
        diameter: 0.5,
        status: 'healthy'
      };

      const mockTree = {
        _id: '507f1f77bcf86cd799439012',
        ...treeData,
        save: jest.fn().mockResolvedValue(this)
      };

      jest.spyOn(Tree, 'create').mockResolvedValue(mockTree);

      const result = await treeService.createTree(treeData, 'userId');

      expect(result).toEqual(mockTree);
      expect(Tree.create).toHaveBeenCalledWith(
        expect.objectContaining(treeData)
      );
    });

    it('should throw error if species not found', async () => {
      const treeData = {
        speciesId: 'invalid-id',
        location: { latitude: 37.7749, longitude: -122.4194 }
      };

      jest.spyOn(Tree, 'create').mockRejectedValue(
        new Error('Species not found')
      );

      await expect(
        treeService.createTree(treeData, 'userId')
      ).rejects.toThrow('Species not found');
    });
  });

  describe('getTreeById', () => {
    it('should return tree if found', async () => {
      const mockTree = {
        _id: '507f1f77bcf86cd799439012',
        species: 'Oak',
        status: 'healthy'
      };

      jest.spyOn(Tree, 'findById').mockResolvedValue(mockTree);

      const result = await treeService.getTreeById('507f1f77bcf86cd799439012');

      expect(result).toEqual(mockTree);
    });

    it('should throw 404 if tree not found', async () => {
      jest.spyOn(Tree, 'findById').mockResolvedValue(null);

      await expect(
        treeService.getTreeById('nonexistent-id')
      ).rejects.toThrow(ApiError);
    });
  });

  describe('updateTree', () => {
    it('should update tree successfully', async () => {
      const updateData = { status: 'diseased', notes: 'Needs treatment' };
      const mockTree = {
        _id: '507f1f77bcf86cd799439012',
        status: 'healthy',
        save: jest.fn().mockResolvedValue({
          ...this,
          ...updateData
        })
      };

      jest.spyOn(Tree, 'findById').mockResolvedValue(mockTree);

      const result = await treeService.updateTree(
        '507f1f77bcf86cd799439012',
        updateData
      );

      expect(result.status).toBe('diseased');
      expect(mockTree.save).toHaveBeenCalled();
    });
  });

  describe('searchTrees', () => {
    it('should search trees by query', async () => {
      const mockTrees = [
        { species: 'Oak', status: 'healthy' },
        { species: 'Oak', status: 'diseased' }
      ];

      jest.spyOn(Tree, 'find').mockReturnValue({
        populate: jest.fn().mockReturnValue({
          skip: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockTrees)
          })
        })
      });

      const result = await treeService.searchTrees({ q: 'oak' });

      expect(result).toHaveLength(2);
      expect(result[0].species).toBe('Oak');
    });
  });
});
```

### Model Tests

```javascript
// tests/unit/models/tree.model.test.js
import mongoose from 'mongoose';
import Tree from '../../../src/models/tree.model.js';

describe('Tree Model', () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_TEST_URI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Tree.deleteMany({});
  });

  it('should create a tree with valid data', async () => {
    const treeData = {
      speciesId: new mongoose.Types.ObjectId(),
      location: {
        type: 'Point',
        coordinates: [-122.4194, 37.7749],
        address: '123 Main St'
      },
      height: 15.5,
      diameter: 0.5,
      status: 'healthy'
    };

    const tree = await Tree.create(treeData);

    expect(tree._id).toBeDefined();
    expect(tree.height).toBe(15.5);
    expect(tree.status).toBe('healthy');
  });

  it('should fail without required fields', async () => {
    const tree = new Tree({});

    await expect(tree.save()).rejects.toThrow();
  });

  it('should validate location coordinates', async () => {
    const treeData = {
      speciesId: new mongoose.Types.ObjectId(),
      location: {
        type: 'Point',
        coordinates: [200, 100], // Invalid coordinates
        address: '123 Main St'
      }
    };

    await expect(Tree.create(treeData)).rejects.toThrow();
  });

  it('should have geospatial index', async () => {
    const indexes = await Tree.collection.getIndexes();
    expect(indexes['location_2dsphere']).toBeDefined();
  });
});
```

### Utility Tests

```javascript
// tests/unit/utils/validation.test.js
import { validateEmail, validateCoordinates } from '../../../src/utils/validation.js';

describe('Validation Utils', () => {
  describe('validateEmail', () => {
    it('should validate correct emails', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user+tag@domain.co.uk')).toBe(true);
    });

    it('should reject invalid emails', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
      expect(validateEmail('@domain.com')).toBe(false);
    });
  });

  describe('validateCoordinates', () => {
    it('should validate valid coordinates', () => {
      expect(validateCoordinates(37.7749, -122.4194)).toBe(true);
      expect(validateCoordinates(0, 0)).toBe(true);
    });

    it('should reject invalid coordinates', () => {
      expect(validateCoordinates(100, -122.4194)).toBe(false);
      expect(validateCoordinates(37.7749, 200)).toBe(false);
    });
  });
});
```

## Integration Testing

### API Integration Tests

```javascript
// tests/integration/api/trees.test.js
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../../src/index.js';
import Tree from '../../../src/models/tree.model.js';
import User from '../../../src/models/user.model.js';
import { generateToken } from '../../../src/utils/jwt.js';

describe('Trees API Integration Tests', () => {
  let authToken;
  let userId;
  let speciesId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGODB_TEST_URI);
  });

  afterAll(async () => {
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    // Clear database
    await Tree.deleteMany({});
    await User.deleteMany({});

    // Create test user
    const user = await User.create({
      username: 'testuser',
      email: 'test@example.com',
      password: 'Test@123',
      role: 'admin'
    });
    userId = user._id;
    authToken = generateToken(user._id);

    // Create test species
    const species = await Species.create({
      commonName: 'Oak',
      scientificName: 'Quercus'
    });
    speciesId = species._id;
  });

  describe('POST /api/v1/trees', () => {
    it('should create a new tree', async () => {
      const treeData = {
        speciesId: speciesId.toString(),
        location: {
          latitude: 37.7749,
          longitude: -122.4194,
          address: '123 Main St'
        },
        height: 15.5,
        diameter: 0.5,
        status: 'healthy'
      };

      const response = await request(app)
        .post('/api/v1/trees')
        .set('Authorization', `Bearer ${authToken}`)
        .send(treeData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('_id');
      expect(response.body.data.height).toBe(15.5);
    });

    it('should fail without authentication', async () => {
      const treeData = {
        speciesId: speciesId.toString(),
        location: { latitude: 37.7749, longitude: -122.4194 }
      };

      await request(app)
        .post('/api/v1/trees')
        .send(treeData)
        .expect(401);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/v1/trees')
        .set('Authorization', `Bearer ${authToken}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/v1/trees', () => {
    beforeEach(async () => {
      // Create test trees
      await Tree.create([
        {
          speciesId,
          location: {
            type: 'Point',
            coordinates: [-122.4194, 37.7749],
            address: '123 Main St'
          },
          status: 'healthy'
        },
        {
          speciesId,
          location: {
            type: 'Point',
            coordinates: [-122.4195, 37.7750],
            address: '124 Main St'
          },
          status: 'diseased'
        }
      ]);
    });

    it('should get all trees', async () => {
      const response = await request(app)
        .get('/api/v1/trees')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.pagination).toBeDefined();
    });

    it('should filter trees by status', async () => {
      const response = await request(app)
        .get('/api/v1/trees?status=healthy')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe('healthy');
    });

    it('should paginate results', async () => {
      const response = await request(app)
        .get('/api/v1/trees?page=1&limit=1')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.totalPages).toBe(2);
    });
  });

  describe('GET /api/v1/trees/:id', () => {
    let treeId;

    beforeEach(async () => {
      const tree = await Tree.create({
        speciesId,
        location: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749],
          address: '123 Main St'
        },
        status: 'healthy'
      });
      treeId = tree._id;
    });

    it('should get tree by id', async () => {
      const response = await request(app)
        .get(`/api/v1/trees/${treeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data._id).toBe(treeId.toString());
    });

    it('should return 404 for non-existent tree', async () => {
      const fakeId = new mongoose.Types.ObjectId();
      
      await request(app)
        .get(`/api/v1/trees/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });
  });

  describe('PATCH /api/v1/trees/:id', () => {
    let treeId;

    beforeEach(async () => {
      const tree = await Tree.create({
        speciesId,
        location: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749],
          address: '123 Main St'
        },
        status: 'healthy'
      });
      treeId = tree._id;
    });

    it('should update tree', async () => {
      const updateData = { status: 'diseased', notes: 'Needs treatment' };

      const response = await request(app)
        .patch(`/api/v1/trees/${treeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.data.status).toBe('diseased');
      expect(response.body.data.notes).toBe('Needs treatment');
    });
  });

  describe('DELETE /api/v1/trees/:id', () => {
    let treeId;

    beforeEach(async () => {
      const tree = await Tree.create({
        speciesId,
        location: {
          type: 'Point',
          coordinates: [-122.4194, 37.7749],
          address: '123 Main St'
        },
        status: 'healthy'
      });
      treeId = tree._id;
    });

    it('should delete tree', async () => {
      await request(app)
        .delete(`/api/v1/trees/${treeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const tree = await Tree.findById(treeId);
      expect(tree).toBeNull();
    });
  });
});
```

## End-to-End Testing

### Playwright Setup

```javascript
// playwright.config.js
import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:5173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:5173',
    reuseExistingServer: !process.env.CI,
  },
});
```

### E2E Test Example

```javascript
// tests/e2e/auth.spec.js
import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should login successfully', async ({ page }) => {
    // Navigate to login
    await page.click('text=Login');
    
    // Fill credentials
    await page.fill('[name="email"]', 'admin@treenetra.com');
    await page.fill('[name="password"]', 'Admin@123');
    
    // Submit form
    await page.click('button[type="submit"]');
    
    // Verify redirect to dashboard
    await expect(page).toHaveURL('/dashboard');
    await expect(page.locator('h1')).toContainText('Dashboard');
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.click('text=Login');
    
    await page.fill('[name="email"]', 'wrong@example.com');
    await page.fill('[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    await expect(page.locator('.error-message')).toBeVisible();
    await expect(page.locator('.error-message')).toContainText('Invalid credentials');
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('[name="email"]', 'admin@treenetra.com');
    await page.fill('[name="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    
    // Wait for dashboard
    await page.waitForURL('/dashboard');
    
    // Logout
    await page.click('[aria-label="User menu"]');
    await page.click('text=Logout');
    
    // Verify redirect to login
    await expect(page).toHaveURL('/login');
  });
});

test.describe('Tree Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('[name="email"]', 'admin@treenetra.com');
    await page.fill('[name="password"]', 'Admin@123');
    await page.click('button[type="submit"]');
    await page.waitForURL('/dashboard');
  });

  test('should create a new tree', async ({ page }) => {
    // Navigate to add tree page
    await page.click('text=Trees');
    await page.click('text=Add Tree');
    
    // Fill form
    await page.selectOption('[name="speciesId"]', { label: 'Oak' });
    await page.fill('[name="latitude"]', '37.7749');
    await page.fill('[name="longitude"]', '-122.4194');
    await page.fill('[name="address"]', '123 Main St');
    await page.fill('[name="height"]', '15.5');
    await page.fill('[name="diameter"]', '0.5');
    await page.selectOption('[name="status"]', 'healthy');
    
    // Submit
    await page.click('button[type="submit"]');
    
    // Verify success
    await expect(page.locator('.success-message')).toBeVisible();
    await expect(page).toHaveURL(/\/trees\/\w+/);
  });

  test('should search for trees', async ({ page }) => {
    await page.goto('/trees');
    
    // Search
    await page.fill('[placeholder="Search trees"]', 'oak');
    await page.press('[placeholder="Search trees"]', 'Enter');
    
    // Verify results
    await expect(page.locator('.tree-card')).toHaveCount(3);
    await expect(page.locator('.tree-card').first()).toContainText('Oak');
  });
});
```

## Test Coverage

### Running Coverage

```bash
# Generate coverage report
npm run test:coverage

# View HTML report
open coverage/index.html
```

### Coverage Thresholds

```javascript
// jest.config.js
export default {
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/index.js',
    '!src/**/*.test.js'
  ],
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80
    }
  }
};
```

### Coverage Best Practices

- ✅ Aim for 80%+ coverage
- ✅ Focus on critical paths
- ✅ Test edge cases
- ✅ Don't chase 100% mindlessly
- ✅ Use coverage to find gaps

## Best Practices

### 1. Test Naming

```javascript
// ✓ Good - Descriptive and clear
it('should return 404 when tree not found', () => {});
it('should create tree with valid data', () => {});

// ✗ Bad - Vague and unclear
it('works', () => {});
it('test1', () => {});
```

### 2. Arrange-Act-Assert (AAA)

```javascript
it('should calculate health score', () => {
  // Arrange
  const tree = { id: '123', status: 'healthy' };
  const records = [{ score: 90 }, { score: 95 }];
  
  // Act
  const score = calculateHealthScore(tree, records);
  
  // Assert
  expect(score).toBe(92.5);
});
```

### 3. One Assertion Per Test

```javascript
// ✓ Good
it('should return correct status code', () => {
  expect(response.statusCode).toBe(200);
});

it('should return correct data structure', () => {
  expect(response.body).toHaveProperty('data');
});

// ✗ Bad
it('should work correctly', () => {
  expect(response.statusCode).toBe(200);
  expect(response.body).toHaveProperty('data');
  expect(response.body.data).toBeArray();
});
```

### 4. Mock External Dependencies

```javascript
// Mock external API
jest.mock('../../../src/services/weather.service.js', () => ({
  getWeather: jest.fn().mockResolvedValue({
    temperature: 72,
    condition: 'sunny'
  })
}));
```

### 5. Use Test Fixtures

```javascript
// tests/fixtures/trees.json
export const validTree = {
  speciesId: '507f1f77bcf86cd799439011',
  location: { latitude: 37.7749, longitude: -122.4194 },
  status: 'healthy'
};

export const diseasedTree = {
  speciesId: '507f1f77bcf86cd799439011',
  location: { latitude: 37.7750, longitude: -122.4195 },
  status: 'diseased'
};
```

## CI/CD Testing

### GitHub Actions

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      mongodb:
        image: mongo:7
        ports:
          - 27017:27017
      
      redis:
        image: redis:7
        ports:
          - 6379:6379
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run linter
        run: npm run lint
      
      - name: Run unit tests
        run: npm run test:unit
      
      - name: Run integration tests
        run: npm run test:integration
        env:
          MONGODB_TEST_URI: mongodb://localhost:27017/test
          REDIS_HOST: localhost
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

## Common Testing Commands

```bash
# Run all tests
npm test

# Run specific test file
npm test tree.service.test.js

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm run test:coverage

# Run unit tests only
npm run test:unit

# Run integration tests only
npm run test:integration

# Run E2E tests
npm run test:e2e

# Update snapshots
npm test -- -u

# Run tests matching pattern
npm test -- --testNamePattern="create tree"
```

## Troubleshooting

### Tests Timing Out

```javascript
// Increase timeout for slow tests
it('should process large dataset', async () => {
  // ...
}, 10000); // 10 second timeout
```

### Database Connection Issues

```javascript
// Use separate test database
beforeAll(async () => {
  await mongoose.connect(process.env.MONGODB_TEST_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
```

### Flaky Tests

```javascript
// Add retries for flaky tests
jest.retryTimes(3);
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Testing Best Practices](https://testingjavascript.com/)

---

**Happy Testing! 🧪**
