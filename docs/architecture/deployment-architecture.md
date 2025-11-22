# Deployment Architecture

## Table of Contents

- [Introduction](#introduction)
- [Infrastructure Overview](#infrastructure-overview)
- [Environments](#environments)
- [Containerization](#containerization)
- [Orchestration](#orchestration)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring & Logging](#monitoring--logging)
- [Disaster Recovery](#disaster-recovery)
- [Scaling Strategy](#scaling-strategy)

## Introduction

This document outlines the deployment architecture for TreeNetra, covering infrastructure, deployment strategies, and operational procedures.

### Deployment Goals

- **Reliability**: 99.9% uptime
- **Scalability**: Auto-scaling based on demand
- **Security**: Defense in depth
- **Automation**: Fully automated deployments
- **Observability**: Comprehensive monitoring and logging

## Infrastructure Overview

### Cloud Provider: AWS (Primary)

```
┌─────────────────────────────────────────────────────────────┐
│                        Route 53 (DNS)                        │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                    CloudFront (CDN)                          │
│  - Static assets                                             │
│  - Global edge locations                                     │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                  Application Load Balancer                   │
│  - SSL termination                                           │
│  - Health checks                                             │
│  - Request routing                                           │
└───┬──────────────────────────────────────────────┬──────────┘
    │                                              │
┌───▼────────────────────────┐    ┌──────────────▼───────────┐
│  ECS Cluster (us-east-1a)  │    │ ECS Cluster (us-east-1b) │
│  ┌──────────────────────┐  │    │ ┌──────────────────────┐ │
│  │  API Service (3x)    │  │    │ │  API Service (3x)    │ │
│  └──────────────────────┘  │    │ └──────────────────────┘ │
│  ┌──────────────────────┐  │    │ ┌──────────────────────┐ │
│  │ Worker Service (2x)  │  │    │ │ Worker Service (2x)  │ │
│  └──────────────────────┘  │    │ └──────────────────────┘ │
└────────────┬───────────────┘    └─────────────┬────────────┘
             │                                   │
┌────────────▼───────────────────────────────────▼────────────┐
│                     RDS PostgreSQL                           │
│  - Multi-AZ deployment                                       │
│  - Automated backups                                         │
│  - Read replicas                                             │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                  ElastiCache Redis Cluster                   │
│  - Session storage                                           │
│  - Application cache                                         │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                       S3 Buckets                             │
│  - Tree images                                               │
│  - Backups                                                   │
│  - Static assets                                             │
└─────────────────────────────────────────────────────────────┘
```

### Infrastructure Components

#### Compute
- **Amazon ECS**: Container orchestration
- **Fargate**: Serverless container compute
- **EC2**: Reserved instances for stable workloads
- **Lambda**: Event-driven functions

#### Database
- **Amazon RDS PostgreSQL**: Primary database (Multi-AZ)
- **Read Replicas**: Scale read operations
- **Amazon ElastiCache Redis**: Caching layer

#### Storage
- **Amazon S3**: Object storage
- **Amazon EBS**: Block storage for databases
- **Amazon EFS**: Shared file systems

#### Networking
- **VPC**: Isolated network environment
- **Subnets**: Public and private subnets across AZs
- **Security Groups**: Firewall rules
- **NAT Gateway**: Outbound internet for private subnets
- **Application Load Balancer**: Traffic distribution

#### CDN & DNS
- **Amazon CloudFront**: Content delivery network
- **Amazon Route 53**: DNS and traffic management

## Environments

### Environment Architecture

```
Development → Staging → Production
```

### 1. Development Environment

```yaml
Purpose: Local development and testing
Infrastructure:
  - Docker Compose for local services
  - Local PostgreSQL database
  - Local Redis instance
  - Localstack for AWS services
Resources:
  - CPU: Minimal
  - Memory: 4GB
  - Storage: 20GB
```

### 2. Staging Environment

```yaml
Purpose: Pre-production testing
Infrastructure:
  - ECS Fargate (1 task per service)
  - RDS PostgreSQL (db.t3.medium)
  - ElastiCache Redis (cache.t3.small)
  - S3 buckets
Resources:
  - API: 1 vCPU, 2GB RAM (1 task)
  - Database: db.t3.medium (2 vCPU, 4GB RAM)
  - Cache: cache.t3.small (2 vCPU, 1.5GB RAM)
Cost: ~$200/month
```

### 3. Production Environment

```yaml
Purpose: Live production system
Infrastructure:
  - ECS Fargate (auto-scaling 3-10 tasks)
  - RDS PostgreSQL (db.r5.xlarge, Multi-AZ)
  - ElastiCache Redis (cache.r5.large, clustered)
  - CloudFront CDN
  - Multi-AZ deployment
Resources:
  - API: 2 vCPU, 4GB RAM (3-10 tasks)
  - Database: db.r5.xlarge (4 vCPU, 32GB RAM)
  - Cache: cache.r5.large (2 vCPU, 13.5GB RAM)
High Availability:
  - Multi-AZ deployment
  - Auto-scaling
  - Automated failover
Cost: ~$1,500-3,000/month (depending on load)
```

## Containerization

### Docker Setup

#### Dockerfile
```dockerfile
# Multi-stage build for efficiency
FROM node:18-alpine AS builder

WORKDIR /app

# Copy dependency files
COPY package*.json ./
RUN npm ci --only=production

# Copy source code
COPY . .

# Build application
RUN npm run build

# Production image
FROM node:18-alpine

WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init

# Create non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Copy built application
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/node_modules ./node_modules
COPY --from=builder --chown=nodejs:nodejs /app/package*.json ./

# Switch to non-root user
USER nodejs

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=40s \
  CMD node healthcheck.js

# Use dumb-init as entrypoint
ENTRYPOINT ["dumb-init", "--"]

# Start application
CMD ["node", "dist/index.js"]
```

#### docker-compose.yml (Development)
```yaml
version: '3.8'

services:
  api:
    build:
      context: .
      dockerfile: Dockerfile.dev
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=development
      - DATABASE_URL=postgresql://postgres:password@db:5432/treenetra
      - REDIS_URL=redis://redis:6379
    volumes:
      - ./src:/app/src
      - /app/node_modules
    depends_on:
      - db
      - redis
    networks:
      - treenetra-network

  db:
    image: postgres:15-alpine
    environment:
      - POSTGRES_DB=treenetra
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data
    networks:
      - treenetra-network

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data
    networks:
      - treenetra-network

  elasticsearch:
    image: elasticsearch:8.10.0
    environment:
      - discovery.type=single-node
      - ES_JAVA_OPTS=-Xms512m -Xmx512m
    ports:
      - "9200:9200"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    networks:
      - treenetra-network

volumes:
  postgres_data:
  redis_data:
  elasticsearch_data:

networks:
  treenetra-network:
    driver: bridge
```

## Orchestration

### Kubernetes Configuration (Alternative)

#### Deployment
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: treenetra-api
  namespace: treenetra
spec:
  replicas: 3
  selector:
    matchLabels:
      app: treenetra-api
  template:
    metadata:
      labels:
        app: treenetra-api
    spec:
      containers:
      - name: api
        image: treenetra/api:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: DATABASE_URL
          valueFrom:
            secretKeyRef:
              name: treenetra-secrets
              key: database-url
        - name: REDIS_URL
          valueFrom:
            configMapKeyRef:
              name: treenetra-config
              key: redis-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /ready
            port: 3000
          initialDelaySeconds: 10
          periodSeconds: 5
---
apiVersion: v1
kind: Service
metadata:
  name: treenetra-api-service
  namespace: treenetra
spec:
  selector:
    app: treenetra-api
  ports:
  - port: 80
    targetPort: 3000
  type: LoadBalancer
---
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: treenetra-api-hpa
  namespace: treenetra
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: treenetra-api
  minReplicas: 3
  maxReplicas: 10
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
```

## CI/CD Pipeline

### GitHub Actions Workflow

```yaml
name: Deploy to Production

on:
  push:
    branches: [main]
  workflow_dispatch:

env:
  AWS_REGION: us-east-1
  ECR_REPOSITORY: treenetra-api
  ECS_SERVICE: treenetra-api-service
  ECS_CLUSTER: treenetra-production
  ECS_TASK_DEFINITION: .aws/task-definition.json

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Run linter
        run: npm run lint

  build-and-push:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Login to Amazon ECR
        id: login-ecr
        uses: aws-actions/amazon-ecr-login@v2
      
      - name: Build, tag, and push image
        env:
          ECR_REGISTRY: ${{ steps.login-ecr.outputs.registry }}
          IMAGE_TAG: ${{ github.sha }}
        run: |
          docker build -t $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG .
          docker tag $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG \
                     $ECR_REGISTRY/$ECR_REPOSITORY:latest
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG
          docker push $ECR_REGISTRY/$ECR_REPOSITORY:latest
          echo "image=$ECR_REGISTRY/$ECR_REPOSITORY:$IMAGE_TAG" >> $GITHUB_OUTPUT
        id: build-image
      
      - name: Update ECS task definition
        id: task-def
        uses: aws-actions/amazon-ecs-render-task-definition@v1
        with:
          task-definition: ${{ env.ECS_TASK_DEFINITION }}
          container-name: api
          image: ${{ steps.build-image.outputs.image }}
      
      - name: Deploy to ECS
        uses: aws-actions/amazon-ecs-deploy-task-definition@v1
        with:
          task-definition: ${{ steps.task-def.outputs.task-definition }}
          service: ${{ env.ECS_SERVICE }}
          cluster: ${{ env.ECS_CLUSTER }}
          wait-for-service-stability: true
      
      - name: Notify deployment
        if: success()
        run: |
          echo "Deployment successful!"
          # Add Slack/Discord notification here
```

### Deployment Strategies

#### 1. Blue-Green Deployment

```yaml
Blue (Current) → Green (New Version) → Switch Traffic → Terminate Blue
```

**Benefits:**
- Zero downtime
- Easy rollback
- Full testing before switch

#### 2. Rolling Update

```yaml
Replace instances gradually: 
- Stop 1 instance
- Deploy new version
- Health check
- Repeat
```

**Benefits:**
- No additional infrastructure
- Gradual rollout
- Resource efficient

#### 3. Canary Deployment

```yaml
Deploy to small subset (10%) → Monitor → Gradually increase → 100%
```

**Benefits:**
- Risk mitigation
- Early issue detection
- Data-driven decisions

## Monitoring & Logging

### Monitoring Stack

```
Application → CloudWatch → Datadog/New Relic → Alerts
```

#### Key Metrics

**Application Metrics:**
- Request rate (requests/second)
- Response time (p50, p95, p99)
- Error rate (%)
- Active connections

**Infrastructure Metrics:**
- CPU utilization (%)
- Memory usage (%)
- Disk I/O
- Network throughput

**Database Metrics:**
- Connection pool size
- Query execution time
- Slow queries
- Deadlocks

**Business Metrics:**
- Active users
- Trees created
- API usage by endpoint

### Logging Architecture

```
Application Logs → CloudWatch Logs → Elasticsearch → Kibana
```

#### Log Aggregation

```json
{
  "timestamp": "2025-11-22T10:30:00Z",
  "level": "info",
  "service": "api",
  "requestId": "req-123",
  "userId": "user-456",
  "method": "GET",
  "path": "/api/v1/trees",
  "statusCode": 200,
  "responseTime": 45,
  "message": "Request completed"
}
```

### Alerting Rules

```yaml
Critical Alerts:
  - Error rate > 5% for 5 minutes
  - API response time p95 > 1000ms for 5 minutes
  - Database connections > 90% for 2 minutes
  - Service down/unavailable

Warning Alerts:
  - Error rate > 2% for 10 minutes
  - CPU usage > 80% for 10 minutes
  - Memory usage > 85% for 10 minutes
  - Disk usage > 80%
```

## Disaster Recovery

### Backup Strategy

#### Database Backups
```yaml
Automated Backups:
  - Frequency: Daily
  - Retention: 30 days
  - Type: Full backup

Point-in-Time Recovery:
  - Enabled: Yes
  - Retention: 7 days

Manual Snapshots:
  - Before major releases
  - Retention: 90 days
```

#### Application Backups
```yaml
Configuration:
  - Infrastructure as Code (Terraform)
  - Version controlled
  - Stored in Git

Secrets:
  - AWS Secrets Manager
  - Encrypted
  - Versioned
```

### Recovery Procedures

#### RTO/RPO Targets

| Scenario | RTO | RPO |
|----------|-----|-----|
| Application failure | 5 minutes | 0 (stateless) |
| Database failure | 15 minutes | 5 minutes |
| AZ failure | 10 minutes | 5 minutes |
| Region failure | 4 hours | 1 hour |

#### Failover Process

```
1. Detect failure (automated monitoring)
2. Trigger failover (automatic or manual)
3. Route traffic to backup (DNS/load balancer)
4. Verify service health
5. Investigate and fix primary
6. Plan failback
```

## Scaling Strategy

### Horizontal Scaling

```yaml
Auto-scaling Configuration:
  Min instances: 3
  Max instances: 10
  Target CPU: 70%
  Target Memory: 80%
  Scale-up cooldown: 60s
  Scale-down cooldown: 300s
```

### Vertical Scaling

```yaml
Database Scaling:
  - Start: db.t3.medium
  - Growth: db.r5.large
  - High load: db.r5.xlarge
  - Peak: db.r5.2xlarge
```

### Caching Strategy

```
Client → CDN → API Gateway → App Cache (Redis) → Database
```

---

**Document Version**: 1.0  
**Last Updated**: November 22, 2025  
**Author**: TreeNetra Team
