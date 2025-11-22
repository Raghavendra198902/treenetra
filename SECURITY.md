# Security Policy

## Supported Versions

We release patches for security vulnerabilities. Currently supported versions:

| Version | Supported          |
| ------- | ------------------ |
| 1.0.x   | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

The TreeNetra team takes security seriously. We appreciate your efforts to responsibly disclose your findings.

### How to Report

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report security vulnerabilities by emailing:

**raghavendra198902@gmail.com**

Include the following information:

- Type of vulnerability
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

### What to Expect

- **Acknowledgment**: We'll acknowledge receipt of your vulnerability report within 48 hours
- **Communication**: We'll keep you informed about the progress of fixing the vulnerability
- **Timeline**: We aim to patch critical vulnerabilities within 7 days
- **Credit**: With your permission, we'll credit you in the security advisory

### Response Timeline

| Stage | Timeframe |
|-------|-----------|
| Initial Response | Within 48 hours |
| Status Update | Within 7 days |
| Fix Implementation | 7-30 days (depending on severity) |
| Public Disclosure | After fix is deployed |

## Security Best Practices

### For Users

1. **Keep Updated**: Always use the latest version
2. **Environment Variables**: Never commit `.env` files or secrets
3. **Access Control**: Use strong authentication and authorization
4. **HTTPS**: Always use HTTPS in production
5. **Dependencies**: Regularly update dependencies

### For Contributors

1. **Code Review**: All code must be reviewed before merging
2. **Testing**: Write security tests for sensitive functionality
3. **Dependencies**: Audit dependencies for known vulnerabilities
4. **Secrets**: Never commit API keys, passwords, or tokens
5. **Input Validation**: Always validate and sanitize user input

## Security Measures

### Current Implementations

- **Authentication**: JWT-based authentication
- **Authorization**: Role-based access control (RBAC)
- **Data Encryption**: Encryption at rest and in transit
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection Prevention**: Parameterized queries
- **XSS Protection**: Content Security Policy (CSP) headers
- **CSRF Protection**: CSRF tokens for state-changing operations
- **Rate Limiting**: API rate limiting to prevent abuse
- **Security Headers**: Helmet.js for security headers
- **Dependency Scanning**: Automated vulnerability scanning

### Security Scanning

We use multiple tools to ensure code security:

- **npm audit**: For dependency vulnerabilities
- **Snyk**: Continuous security monitoring
- **GitHub Security Advisories**: Automated vulnerability alerts
- **CodeQL**: Static code analysis

## Vulnerability Disclosure Policy

### Coordinated Disclosure

We follow a coordinated disclosure policy:

1. **Report Received**: Security team acknowledges the report
2. **Validation**: Team validates and reproduces the vulnerability
3. **Fix Development**: Team develops and tests a fix
4. **Release**: Fix is released in a security update
5. **Public Disclosure**: Advisory is published after users have time to update

### Public Disclosure Timeline

- **Critical vulnerabilities**: 7 days after fix release
- **High severity**: 14 days after fix release
- **Medium/Low severity**: 30 days after fix release

## Security Updates

Security updates are released as soon as possible after a vulnerability is confirmed:

1. **Critical**: Immediate patch release
2. **High**: Within 7 days
3. **Medium**: Within 30 days
4. **Low**: Next regular release

## Security Advisories

Published security advisories can be found at:
https://github.com/Raghavendra198902/treenetra/security/advisories

## Bug Bounty Program

Currently, we do not have a formal bug bounty program. However, we deeply appreciate security researchers who responsibly disclose vulnerabilities and will publicly acknowledge their contributions (with permission).

## Contact

For security-related questions or concerns:

- **Email**: raghavendra198902@gmail.com
- **Subject Line**: [SECURITY] Your subject here
- **PGP Key**: Available upon request

## Security Hall of Fame

We thank the following security researchers for their responsible disclosure:

*No reports yet*

---

Thank you for helping keep TreeNetra and our users safe! 🔒
