# Contributing to TreeNetra

Thank you for your interest in contributing to TreeNetra! This document provides guidelines and instructions for contributing.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [How to Contribute](#how-to-contribute)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)

## Code of Conduct

This project adheres to a Code of Conduct. By participating, you are expected to uphold this code. Please read [CODE_OF_CONDUCT.md](CODE_OF_CONDUCT.md) before contributing.

## Getting Started

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Git
- A GitHub account

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/treenetra.git
   cd treenetra
   ```

3. Add the upstream repository:
   ```bash
   git remote add upstream https://github.com/Raghavendra198902/treenetra.git
   ```

4. Install dependencies:
   ```bash
   npm install
   ```

5. Create your environment file:
   ```bash
   cp .env.example .env
   ```

## How to Contribute

### Reporting Bugs

- Check if the bug has already been reported in [Issues](https://github.com/Raghavendra198902/treenetra/issues)
- Use the bug report template
- Include detailed steps to reproduce
- Provide system information and logs
- Add screenshots if applicable

### Suggesting Features

- Check if the feature has been requested
- Use the feature request template
- Clearly describe the feature and use case
- Explain why this feature would be useful

### Code Contributions

1. Check existing issues or create a new one
2. Comment on the issue to let others know you're working on it
3. Fork and create a branch
4. Make your changes
5. Write or update tests
6. Update documentation
7. Submit a pull request

## Development Workflow

### Creating a Branch

Create a descriptive branch name:

```bash
git checkout -b feature/add-tree-search
git checkout -b fix/api-authentication
git checkout -b docs/update-readme
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation updates
- `refactor/` - Code refactoring
- `test/` - Test additions/updates
- `chore/` - Maintenance tasks

### Keeping Your Fork Updated

```bash
git fetch upstream
git checkout main
git merge upstream/main
git push origin main
```

## Coding Standards

### JavaScript Style Guide

- Use ES6+ features
- 2 spaces for indentation
- Semicolons required
- Single quotes for strings
- Descriptive variable and function names
- Add comments for complex logic

### Example

```javascript
// Good
const fetchTreeData = async (treeId) => {
  try {
    const response = await api.get(`/trees/${treeId}`);
    return response.data;
  } catch (error) {
    logger.error('Failed to fetch tree data', error);
    throw error;
  }
};

// Avoid
var x = async function(id) {
  return await api.get("/trees/" + id).data
}
```

### File Structure

```
src/
├── controllers/     # Request handlers
├── models/          # Data models
├── routes/          # API routes
├── services/        # Business logic
├── middleware/      # Custom middleware
├── utils/           # Helper functions
├── config/          # Configuration
└── index.js         # Entry point
```

### Naming Conventions

- **Files**: kebab-case (e.g., `tree-controller.js`)
- **Classes**: PascalCase (e.g., `TreeService`)
- **Functions**: camelCase (e.g., `fetchTreeData`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`)
- **Private methods**: prefix with `_` (e.g., `_validateInput`)

## Commit Guidelines

### Commit Message Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Formatting, missing semicolons, etc.
- `refactor`: Code restructuring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `perf`: Performance improvements
- `ci`: CI/CD changes

### Examples

```bash
feat(api): add tree search endpoint

Implemented search functionality that allows filtering trees by species,
location, and health status. Includes pagination support.

Closes #42

---

fix(auth): resolve JWT token expiration issue

Fixed bug where tokens were expiring 1 hour earlier than expected due to
timezone handling.

Fixes #156
```

### Commit Best Practices

- Write clear, concise commit messages
- Use present tense ("add feature" not "added feature")
- Reference issues and pull requests
- Keep commits focused and atomic
- Squash minor commits before merging

## Pull Request Process

### Before Submitting

- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] Tests added/updated
- [ ] All tests pass
- [ ] No merge conflicts
- [ ] Commit messages follow guidelines

### Submission

1. Push your branch to your fork
2. Go to the original repository
3. Click "New Pull Request"
4. Select your fork and branch
5. Fill out the PR template completely
6. Link related issues
7. Request review from maintainers

### PR Template Checklist

- Provide clear description
- Specify type of change
- List changes made
- Describe testing performed
- Include screenshots if UI changes
- Complete all checklist items

### Review Process

- Maintainers will review within 2-3 days
- Address feedback promptly
- Be open to suggestions
- Update PR as needed
- Once approved, it will be merged

### After Merge

- Delete your branch
- Update your fork
- Close related issues

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run specific test
npm test -- tests/tree.test.js

# Run with coverage
npm run test:coverage

# Watch mode
npm run test:watch
```

### Writing Tests

```javascript
const { getTreeById } = require('../src/services/tree-service');

describe('TreeService', () => {
  describe('getTreeById', () => {
    it('should return tree data for valid ID', async () => {
      const tree = await getTreeById('123');
      
      expect(tree).toBeDefined();
      expect(tree.id).toBe('123');
      expect(tree.species).toBeDefined();
    });

    it('should throw error for invalid ID', async () => {
      await expect(getTreeById('invalid'))
        .rejects
        .toThrow('Tree not found');
    });
  });
});
```

### Test Coverage

- Aim for at least 80% coverage
- Test happy paths and edge cases
- Include unit and integration tests
- Mock external dependencies

## Documentation

### Code Documentation

- Add JSDoc comments for functions
- Document parameters and return values
- Include usage examples

```javascript
/**
 * Fetches tree data by ID
 * @param {string} treeId - The unique identifier for the tree
 * @returns {Promise<Object>} Tree data object
 * @throws {Error} If tree is not found
 * @example
 * const tree = await getTreeById('123');
 */
async function getTreeById(treeId) {
  // Implementation
}
```

### Documentation Updates

When making changes:
- Update README.md if needed
- Update API documentation in wiki
- Add examples for new features
- Update inline code comments

## Questions?

- Check the [Wiki](https://github.com/Raghavendra198902/treenetra/wiki)
- Open a [Discussion](https://github.com/Raghavendra198902/treenetra/discussions)
- Contact maintainers

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

---

Thank you for contributing to TreeNetra! 🌳
