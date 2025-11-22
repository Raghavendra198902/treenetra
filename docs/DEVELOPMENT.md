# Development Workflow Guide

Complete guide for developing features and contributing to TreeNetra.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Environment](#development-environment)
- [Project Structure](#project-structure)
- [Coding Standards](#coding-standards)
- [Git Workflow](#git-workflow)
- [Feature Development](#feature-development)
- [Testing](#testing)
- [Code Review](#code-review)
- [Debugging](#debugging)
- [Common Tasks](#common-tasks)

## Getting Started

### First Time Setup

```bash
# 1. Fork and clone repository
git clone https://github.com/YOUR_USERNAME/treenetra.git
cd treenetra

# 2. Add upstream remote
git remote add upstream https://github.com/Raghavendra198902/treenetra.git

# 3. Install dependencies
npm install

# 4. Setup environment
cp .env.example .env
# Edit .env with your local settings

# 5. Setup database
npm run setup:db
npm run seed:db

# 6. Start development server
npm run dev
```

### Daily Development

```bash
# Update your fork
git fetch upstream
git merge upstream/main

# Install any new dependencies
npm install

# Start development
npm run dev
```

## Development Environment

### Recommended VS Code Extensions

```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "christian-kohler.npm-intellisense",
    "dsznajder.es7-react-js-snippets",
    "mongodb.mongodb-vscode",
    "rangav.vscode-thunder-client",
    "ms-azuretools.vscode-docker"
  ]
}
```

### Editor Configuration

**.vscode/settings.json**
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "eslint.validate": [
    "javascript",
    "javascriptreact"
  ],
  "files.associations": {
    "*.jsx": "javascriptreact"
  }
}
```

### Environment Setup

**Backend (.env)**
```bash
NODE_ENV=development
PORT=3000
MONGODB_URI=mongodb://localhost:27017/treenetra
JWT_SECRET=development-secret-key-min-32-chars
LOG_LEVEL=debug
```

**Frontend (src/.env.local)**
```bash
VITE_API_URL=http://localhost:3000/api/v1
VITE_APP_NAME=TreeNetra
VITE_ENABLE_DEV_TOOLS=true
```

## Project Structure

```
treenetra/
├── src/                          # Backend source
│   ├── controllers/              # Request handlers
│   ├── services/                 # Business logic
│   ├── models/                   # Database models
│   ├── routes/                   # API routes
│   ├── middleware/               # Express middleware
│   ├── utils/                    # Utility functions
│   ├── database/                 # Database connection
│   ├── pages/                    # React pages (frontend)
│   ├── components/               # React components
│   ├── contexts/                 # React contexts
│   ├── App.jsx                   # React root component
│   ├── main.jsx                  # React entry point
│   └── index.js                  # Backend entry point
├── tests/                        # Test files
│   ├── unit/                     # Unit tests
│   ├── integration/              # Integration tests
│   └── e2e/                      # End-to-end tests
├── config/                       # Configuration files
├── scripts/                      # Utility scripts
├── deployment/                   # Deployment configs
├── docs/                         # Documentation
└── public/                       # Static assets
```

### Module Organization

Each module follows this structure:

```
src/
├── controllers/
│   └── tree.controller.js       # HTTP request/response
├── services/
│   └── tree.service.js          # Business logic
├── models/
│   └── tree.model.js            # Data schema
├── routes/
│   └── tree.routes.js           # API endpoints
└── middleware/
    └── tree.validator.js        # Input validation
```

## Coding Standards

### JavaScript Style Guide

We follow the [Airbnb JavaScript Style Guide](https://github.com/airbnb/javascript).

**Key Rules:**

```javascript
// ✓ Use const/let, never var
const API_URL = 'http://localhost:3000';
let counter = 0;

// ✓ Use arrow functions
const sum = (a, b) => a + b;

// ✓ Use template literals
const greeting = `Hello, ${name}!`;

// ✓ Use destructuring
const { id, name } = user;
const [first, second] = array;

// ✓ Use async/await over promises
const fetchData = async () => {
  const data = await api.get('/trees');
  return data;
};

// ✗ Don't use var
var x = 10; // Bad

// ✗ Don't concatenate strings
const msg = 'Hello, ' + name + '!'; // Bad

// ✗ Don't use callbacks when async/await works
getData((err, data) => { }); // Bad
```

### Naming Conventions

```javascript
// Files: kebab-case
tree-controller.js
user-service.js

// Classes: PascalCase
class TreeService {}
class UserController {}

// Functions/Variables: camelCase
const getUserById = () => {};
const treeCount = 100;

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = 'http://localhost:3000';
const MAX_TREES_PER_PAGE = 20;

// React Components: PascalCase
const TreeCard = () => {};
const UserProfile = () => {};

// Private methods: _prefixWithUnderscore
_validateInput() {}
```

### Code Comments

```javascript
/**
 * Calculates the health score for a tree based on various factors
 * @param {Object} tree - The tree object
 * @param {Array} healthRecords - Array of health records
 * @returns {number} Health score between 0-100
 */
const calculateHealthScore = (tree, healthRecords) => {
  // Implementation details
};

// Good: Explain WHY, not WHAT
// Using exponential backoff to handle API rate limits
await retry(() => api.call(), { backoff: 'exponential' });

// Bad: Obvious comment
// Increment counter by 1
counter++;
```

### Error Handling

```javascript
// ✓ Always use try-catch for async operations
const getTree = async (id) => {
  try {
    const tree = await Tree.findById(id);
    if (!tree) {
      throw new ApiError(404, 'Tree not found');
    }
    return tree;
  } catch (error) {
    logger.error('Error fetching tree:', error);
    throw error;
  }
};

// ✓ Use custom error classes
class ValidationError extends Error {
  constructor(message, fields) {
    super(message);
    this.name = 'ValidationError';
    this.fields = fields;
  }
}

// ✓ Validate input early
const createTree = async (data) => {
  if (!data.location) {
    throw new ValidationError('Location is required', ['location']);
  }
  // Continue processing...
};
```

## Git Workflow

### Branch Strategy

```bash
main                    # Production-ready code
├── develop            # Development branch
├── feature/xxx        # Feature branches
├── bugfix/xxx         # Bug fix branches
├── hotfix/xxx         # Emergency fixes
└── release/xxx        # Release branches
```

### Creating a Feature

```bash
# 1. Update main branch
git checkout main
git pull upstream main

# 2. Create feature branch
git checkout -b feature/add-tree-tagging

# 3. Make changes
# ... code changes ...

# 4. Commit changes
git add .
git commit -m "feat: Add tree tagging functionality"

# 5. Push to your fork
git push origin feature/add-tree-tagging

# 6. Create Pull Request on GitHub
```

### Commit Message Format

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting)
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

**Examples:**

```bash
# Good commits
git commit -m "feat(trees): Add filtering by species"
git commit -m "fix(auth): Resolve token refresh issue"
git commit -m "docs(api): Update authentication examples"

# Bad commits
git commit -m "updated stuff"
git commit -m "fix bug"
git commit -m "WIP"
```

### Pull Request Process

1. **Create PR with descriptive title**
   ```
   feat(trees): Add geospatial search functionality
   ```

2. **Fill out PR template**
   - Description of changes
   - Related issues
   - Testing performed
   - Screenshots (if UI changes)

3. **Ensure CI passes**
   - All tests passing
   - No linting errors
   - Code coverage maintained

4. **Request review**
   - Assign reviewers
   - Address feedback
   - Update PR as needed

5. **Merge**
   - Squash commits if needed
   - Delete branch after merge

## Feature Development

### Step-by-Step Process

#### 1. Plan the Feature

- [ ] Review requirements
- [ ] Check existing code
- [ ] Design API endpoints
- [ ] Plan database changes
- [ ] Write technical spec

#### 2. Backend Development

```bash
# Create model
src/models/tag.model.js

# Create service
src/services/tag.service.js

# Create controller
src/controllers/tag.controller.js

# Create routes
src/routes/tag.routes.js

# Add validation middleware
src/middleware/tag.validator.js

# Update main router
src/routes/index.js
```

**Example: Adding Tags Feature**

```javascript
// 1. Model (src/models/tag.model.js)
const tagSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  color: { type: String, default: '#3B82F6' },
  description: String,
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

// 2. Service (src/services/tag.service.js)
class TagService {
  async createTag(data, userId) {
    const tag = await Tag.create({ ...data, createdBy: userId });
    return tag;
  }

  async getAllTags() {
    return await Tag.find().populate('createdBy', 'username');
  }
}

// 3. Controller (src/controllers/tag.controller.js)
const createTag = async (req, res, next) => {
  try {
    const tag = await tagService.createTag(req.body, req.user.id);
    res.status(201).json(apiResponse(201, 'Tag created', tag));
  } catch (error) {
    next(error);
  }
};

// 4. Routes (src/routes/tag.routes.js)
router.post('/', auth, validate(tagSchema), createTag);
router.get('/', auth, getAllTags);
```

#### 3. Frontend Development

```bash
# Create page
src/pages/Tags.jsx

# Create components
src/components/TagList.jsx
src/components/TagForm.jsx

# Add to router
src/App.jsx
```

**Example: Tags Page**

```jsx
// src/pages/Tags.jsx
import { useState, useEffect } from 'react';
import { api } from '../utils/api';
import TagList from '../components/TagList';
import TagForm from '../components/TagForm';

const Tags = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTags();
  }, []);

  const fetchTags = async () => {
    try {
      const { data } = await api.get('/tags');
      setTags(data.data);
    } catch (error) {
      console.error('Error fetching tags:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTag = async (tagData) => {
    const { data } = await api.post('/tags', tagData);
    setTags([...tags, data.data]);
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Tags</h1>
      <TagForm onSubmit={handleCreateTag} />
      <TagList tags={tags} />
    </div>
  );
};
```

#### 4. Write Tests

```javascript
// tests/unit/services/tag.service.test.js
describe('TagService', () => {
  describe('createTag', () => {
    it('should create a new tag', async () => {
      const tagData = { name: 'Native', color: '#10B981' };
      const tag = await tagService.createTag(tagData, userId);
      
      expect(tag.name).toBe('Native');
      expect(tag.color).toBe('#10B981');
      expect(tag.createdBy).toBe(userId);
    });

    it('should throw error for duplicate tag', async () => {
      const tagData = { name: 'Native' };
      await tagService.createTag(tagData, userId);
      
      await expect(
        tagService.createTag(tagData, userId)
      ).rejects.toThrow('Tag already exists');
    });
  });
});
```

#### 5. Update Documentation

```bash
# Update API documentation
docs/architecture/api-architecture.md

# Update README if needed
README.md

# Add JSDoc comments
src/services/tag.service.js
```

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test file
npm test tag.service.test.js

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch

# Run integration tests
npm run test:integration
```

### Writing Tests

```javascript
// Unit test example
describe('TreeService', () => {
  let treeService;
  let mockTreeModel;

  beforeEach(() => {
    mockTreeModel = {
      find: jest.fn(),
      findById: jest.fn(),
      create: jest.fn()
    };
    treeService = new TreeService(mockTreeModel);
  });

  it('should get tree by id', async () => {
    const mockTree = { id: '123', species: 'Oak' };
    mockTreeModel.findById.mockResolvedValue(mockTree);

    const result = await treeService.getTreeById('123');

    expect(result).toEqual(mockTree);
    expect(mockTreeModel.findById).toHaveBeenCalledWith('123');
  });
});
```

## Code Review

### Review Checklist

**As a Reviewer:**
- [ ] Code follows style guide
- [ ] Tests are included and passing
- [ ] Documentation is updated
- [ ] No security vulnerabilities
- [ ] Performance considerations addressed
- [ ] Error handling is proper
- [ ] Code is maintainable

**As an Author:**
- [ ] Self-review completed
- [ ] All tests passing
- [ ] No console.logs left
- [ ] Code is formatted
- [ ] Commits are clean
- [ ] PR description is complete

### Review Guidelines

```javascript
// ✓ Constructive feedback
"Consider using Array.map() here for better readability"
"Great use of async/await! One suggestion: add error handling"

// ✗ Unhelpful feedback
"This is wrong"
"Rewrite this"
```

## Debugging

### Backend Debugging

```bash
# Enable debug mode
NODE_ENV=development LOG_LEVEL=debug npm run dev

# Use Node debugger
node --inspect src/index.js

# VS Code launch.json
{
  "type": "node",
  "request": "launch",
  "name": "Debug Backend",
  "program": "${workspaceFolder}/src/index.js",
  "env": {
    "NODE_ENV": "development"
  }
}
```

### Frontend Debugging

```javascript
// React DevTools
// Install: https://react.dev/learn/react-developer-tools

// Debug render cycles
useEffect(() => {
  console.log('Component rendered', { props, state });
}, [props, state]);

// Network debugging
import axios from 'axios';
axios.interceptors.request.use(request => {
  console.log('Starting Request', request);
  return request;
});
```

### Database Debugging

```bash
# Connect to MongoDB
mongosh mongodb://localhost:27017/treenetra

# View collections
show collections

# Query data
db.trees.find().pretty()

# Check indexes
db.trees.getIndexes()

# Explain query
db.trees.find({ status: 'healthy' }).explain('executionStats')
```

## Common Tasks

### Adding a New API Endpoint

```bash
# 1. Add route
src/routes/tree.routes.js

# 2. Add controller method
src/controllers/tree.controller.js

# 3. Add service method
src/services/tree.service.js

# 4. Add validation
src/middleware/validators/tree.validator.js

# 5. Test endpoint
npm test src/tests/integration/tree.test.js

# 6. Update API docs
docs/architecture/api-architecture.md
```

### Adding a Database Field

```bash
# 1. Update model
src/models/tree.model.js

# 2. Create migration script
scripts/migrations/add-tree-field.js

# 3. Run migration
npm run migrate

# 4. Update tests
tests/unit/models/tree.model.test.js

# 5. Update API docs
```

### Adding Environment Variable

```bash
# 1. Add to .env.example
NEW_VARIABLE=example_value

# 2. Add to config
config/index.js

# 3. Document in README
README.md

# 4. Update deployment configs
deployment/kubernetes/api-deployment.yaml
```

## Best Practices

1. **Write Clean Code**
   - Keep functions small
   - Single responsibility principle
   - Meaningful names
   - DRY (Don't Repeat Yourself)

2. **Test Everything**
   - Unit tests for services
   - Integration tests for APIs
   - E2E tests for workflows

3. **Document Thoroughly**
   - JSDoc for functions
   - README for setup
   - Architecture docs for design

4. **Review Carefully**
   - Review your own code first
   - Be respectful in reviews
   - Learn from feedback

5. **Stay Updated**
   - Keep dependencies updated
   - Follow security advisories
   - Learn new patterns

## Getting Help

- 📖 [Architecture Documentation](architecture/README.md)
- 🐛 [Report Issues](https://github.com/Raghavendra198902/treenetra/issues)
- 💬 [Discussions](https://github.com/Raghavendra198902/treenetra/discussions)
- 📧 Email: dev@treenetra.com

---

**Happy Coding! 🚀**
