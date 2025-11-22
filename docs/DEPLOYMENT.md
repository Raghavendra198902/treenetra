# TreeNetra Deployment Guide

Complete guide for deploying TreeNetra to various environments.

## Table of Contents

- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Local Development](#local-development)
- [Docker Deployment](#docker-deployment)
- [Kubernetes Deployment](#kubernetes-deployment)
- [Production Deployment](#production-deployment)
- [CI/CD Pipeline](#cicd-pipeline)
- [Monitoring & Logging](#monitoring--logging)
- [Troubleshooting](#troubleshooting)

## Prerequisites

### Required Software

| Software | Minimum Version | Purpose |
|----------|----------------|---------|
| Node.js | 18.x | Runtime environment |
| MongoDB | 7.0+ | Primary database |
| Redis | 7.0+ | Caching layer |
| Docker | 24.0+ | Containerization |
| Kubernetes | 1.28+ | Orchestration (prod) |
| Git | 2.40+ | Version control |

### System Requirements

**Development:**
- 4GB RAM minimum
- 2GB free disk space
- 2 CPU cores

**Production:**
- 8GB RAM minimum
- 20GB free disk space
- 4 CPU cores
- Load balancer
- SSL certificates

## Environment Setup

### 1. Environment Variables

Create environment files for each environment:

#### Development (.env.development)
```bash
# Server Configuration
NODE_ENV=development
PORT=3000
FRONTEND_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/treenetra
MONGODB_TEST_URI=mongodb://localhost:27017/treenetra_test

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_EXPIRE=24h
JWT_REFRESH_SECRET=your-super-secret-refresh-key-min-32-characters
JWT_REFRESH_EXPIRE=7d

# Email (Development - Mailtrap)
EMAIL_HOST=smtp.mailtrap.io
EMAIL_PORT=2525
EMAIL_USER=your-mailtrap-user
EMAIL_PASSWORD=your-mailtrap-password
EMAIL_FROM=noreply@treenetra.com

# AWS S3 (Optional)
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_S3_BUCKET=

# API Keys (Optional)
GOOGLE_MAPS_API_KEY=
WEATHER_API_KEY=

# Logging
LOG_LEVEL=debug
LOG_FILE=logs/app.log
```

#### Production (.env.production)
```bash
# Server Configuration
NODE_ENV=production
PORT=3000
FRONTEND_URL=https://treenetra.com

# Database
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/treenetra?retryWrites=true&w=majority
MONGODB_OPTIONS_POOL_SIZE=10
MONGODB_OPTIONS_SERVER_SELECTION_TIMEOUT=5000

# Redis
REDIS_HOST=redis.production.host
REDIS_PORT=6379
REDIS_PASSWORD=your-redis-password
REDIS_TLS=true

# JWT Configuration
JWT_SECRET=your-production-jwt-secret-very-long-and-secure
JWT_EXPIRE=2h
JWT_REFRESH_SECRET=your-production-refresh-secret-very-long-and-secure
JWT_REFRESH_EXPIRE=7d

# Email (Production - SendGrid)
EMAIL_HOST=smtp.sendgrid.net
EMAIL_PORT=587
EMAIL_USER=apikey
EMAIL_PASSWORD=your-sendgrid-api-key
EMAIL_FROM=noreply@treenetra.com

# AWS S3 (Required in production)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=treenetra-production-uploads

# API Keys
GOOGLE_MAPS_API_KEY=your-google-maps-api-key
WEATHER_API_KEY=your-weather-api-key

# Security
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
CORS_ORIGIN=https://treenetra.com

# Logging
LOG_LEVEL=info
LOG_FILE=/var/log/treenetra/app.log
```

### 2. Secrets Management

**For Production:**

```bash
# Using environment secrets manager
aws secretsmanager create-secret \
  --name treenetra/production/env \
  --secret-string file://.env.production

# Or use Kubernetes secrets
kubectl create secret generic treenetra-secrets \
  --from-env-file=.env.production \
  --namespace=treenetra
```

## Local Development

### Quick Start

```bash
# 1. Clone repository
git clone https://github.com/Raghavendra198902/treenetra.git
cd treenetra

# 2. Install dependencies
npm install

# 3. Setup environment
cp .env.example .env
# Edit .env with your settings

# 4. Start MongoDB and Redis
sudo systemctl start mongod
sudo systemctl start redis

# 5. Setup database
npm run setup:db
npm run seed:db

# 6. Start development server
npm run dev
```

**Access:**
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API Docs: http://localhost:3000/api-docs

## Docker Deployment

### Single Container Deployment

```bash
# Build image
docker build -t treenetra:latest .

# Run container
docker run -d \
  --name treenetra \
  -p 3000:3000 \
  --env-file .env.production \
  treenetra:latest
```

### Docker Compose Deployment (Recommended)

```bash
# Start all services
npm run docker:up

# Or manually
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild and restart
docker-compose up -d --build
```

**Services Included:**
- MongoDB (port 27017)
- Redis (port 6379)
- TreeNetra API (port 3000)
- Nginx (port 80/443)

### Docker Commands

```bash
# Build production image
docker build -t treenetra:v1.0.0 .

# Tag for registry
docker tag treenetra:v1.0.0 your-registry/treenetra:v1.0.0

# Push to registry
docker push your-registry/treenetra:v1.0.0

# Run with custom config
docker run -d \
  --name treenetra \
  -p 3000:3000 \
  -v $(pwd)/logs:/app/logs \
  -v $(pwd)/uploads:/app/uploads \
  --env-file .env.production \
  --restart unless-stopped \
  treenetra:v1.0.0

# View logs
docker logs -f treenetra

# Execute commands inside container
docker exec -it treenetra npm run seed:db

# Stop and remove
docker stop treenetra
docker rm treenetra
```

## Kubernetes Deployment

### Prerequisites

```bash
# Install kubectl
curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
sudo install -o root -g root -m 0755 kubectl /usr/local/bin/kubectl

# Verify installation
kubectl version --client

# Configure cluster access
kubectl config use-context your-cluster
```

### Deploy to Kubernetes

```bash
# 1. Create namespace
kubectl create namespace treenetra

# 2. Create secrets
kubectl create secret generic treenetra-secrets \
  --from-env-file=.env.production \
  --namespace=treenetra

# 3. Deploy MongoDB
kubectl apply -f deployment/kubernetes/mongodb-statefulset.yaml

# 4. Deploy Redis
kubectl apply -f deployment/kubernetes/redis-deployment.yaml

# 5. Deploy API
kubectl apply -f deployment/kubernetes/api-deployment.yaml

# 6. Verify deployment
kubectl get pods -n treenetra
kubectl get services -n treenetra
```

### Kubernetes Manifests Overview

**API Deployment** (`deployment/kubernetes/api-deployment.yaml`)
- 3 replicas for high availability
- Rolling update strategy
- Resource limits and requests
- Liveness and readiness probes
- Auto-scaling configuration

**MongoDB StatefulSet** (`deployment/kubernetes/mongodb-statefulset.yaml`)
- Persistent volume for data
- Headless service for stable network identity
- 10Gi storage

**Redis Deployment** (`deployment/kubernetes/redis-deployment.yaml`)
- Single replica (can be clustered)
- ClusterIP service

### Scale Deployment

```bash
# Scale API pods
kubectl scale deployment treenetra-api \
  --replicas=5 \
  --namespace=treenetra

# Enable auto-scaling
kubectl autoscale deployment treenetra-api \
  --min=3 \
  --max=10 \
  --cpu-percent=80 \
  --namespace=treenetra
```

### Rolling Updates

```bash
# Update image
kubectl set image deployment/treenetra-api \
  api=your-registry/treenetra:v1.1.0 \
  --namespace=treenetra

# Monitor rollout
kubectl rollout status deployment/treenetra-api -n treenetra

# Rollback if needed
kubectl rollout undo deployment/treenetra-api -n treenetra
```

### Kubernetes Commands

```bash
# Get pod logs
kubectl logs -f deployment/treenetra-api -n treenetra

# Execute command in pod
kubectl exec -it treenetra-api-xxx -n treenetra -- npm run seed:db

# Port forward for testing
kubectl port-forward service/treenetra-api 3000:3000 -n treenetra

# Get pod status
kubectl get pods -n treenetra -o wide

# Describe pod for debugging
kubectl describe pod treenetra-api-xxx -n treenetra

# Delete and recreate
kubectl delete -f deployment/kubernetes/
kubectl apply -f deployment/kubernetes/
```

## Production Deployment

### AWS Deployment

#### 1. Setup AWS Resources

```bash
# Create VPC and subnets
aws ec2 create-vpc --cidr-block 10.0.0.0/16

# Create EKS cluster
aws eks create-cluster \
  --name treenetra-cluster \
  --role-arn arn:aws:iam::xxx:role/eks-service-role \
  --resources-vpc-config subnetIds=subnet-xxx,subnet-yyy

# Create RDS for MongoDB alternative
aws rds create-db-instance \
  --db-instance-identifier treenetra-db \
  --engine mongodb \
  --instance-class db.t3.medium \
  --allocated-storage 100

# Create ElastiCache for Redis
aws elasticache create-cache-cluster \
  --cache-cluster-id treenetra-redis \
  --engine redis \
  --cache-node-type cache.t3.micro \
  --num-cache-nodes 1
```

#### 2. Deploy Application

```bash
# Configure kubectl for EKS
aws eks update-kubeconfig --name treenetra-cluster

# Deploy application
kubectl apply -f deployment/kubernetes/

# Setup load balancer
kubectl apply -f deployment/kubernetes/ingress.yaml
```

#### 3. Configure Domain

```bash
# Get load balancer URL
kubectl get ingress -n treenetra

# Create Route53 record
aws route53 change-resource-record-sets \
  --hosted-zone-id Z1234567890ABC \
  --change-batch file://route53-change.json
```

### DigitalOcean Deployment

```bash
# Create Kubernetes cluster
doctl kubernetes cluster create treenetra-cluster \
  --region nyc1 \
  --node-pool "name=worker-pool;size=s-2vcpu-4gb;count=3"

# Get kubeconfig
doctl kubernetes cluster kubeconfig save treenetra-cluster

# Deploy application
kubectl apply -f deployment/kubernetes/

# Setup load balancer
kubectl apply -f deployment/digitalocean/loadbalancer.yaml
```

### Environment Checklist

- [ ] SSL certificates configured (Let's Encrypt or ACM)
- [ ] Domain DNS configured
- [ ] Environment variables set
- [ ] Database backups enabled
- [ ] Monitoring tools configured
- [ ] Log aggregation setup
- [ ] Secrets properly secured
- [ ] Rate limiting configured
- [ ] CORS settings verified
- [ ] Health checks passing

## CI/CD Pipeline

### GitHub Actions

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy TreeNetra

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm test

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: docker/build-push-action@v4
        with:
          push: true
          tags: ${{ secrets.DOCKER_REGISTRY }}/treenetra:latest

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      - name: Deploy to Kubernetes
        run: |
          kubectl set image deployment/treenetra-api \
            api=${{ secrets.DOCKER_REGISTRY }}/treenetra:latest
```

### Deployment Script

```bash
#!/bin/bash
# deployment/deploy.sh

set -e

echo "🚀 Starting TreeNetra deployment..."

# Build Docker image
echo "📦 Building Docker image..."
docker build -t treenetra:latest .

# Tag image
echo "🏷️  Tagging image..."
docker tag treenetra:latest your-registry/treenetra:$(git rev-parse --short HEAD)

# Push to registry
echo "📤 Pushing to registry..."
docker push your-registry/treenetra:$(git rev-parse --short HEAD)

# Deploy to Kubernetes
echo "☸️  Deploying to Kubernetes..."
kubectl set image deployment/treenetra-api \
  api=your-registry/treenetra:$(git rev-parse --short HEAD) \
  --namespace=treenetra

# Wait for rollout
echo "⏳ Waiting for rollout..."
kubectl rollout status deployment/treenetra-api -n treenetra

echo "✅ Deployment completed successfully!"
```

## Monitoring & Logging

### Setup Prometheus

```bash
# Install Prometheus Operator
kubectl apply -f https://raw.githubusercontent.com/prometheus-operator/prometheus-operator/main/bundle.yaml

# Create ServiceMonitor
kubectl apply -f deployment/monitoring/service-monitor.yaml
```

### Setup Grafana

```bash
# Install Grafana
kubectl apply -f deployment/monitoring/grafana.yaml

# Access Grafana
kubectl port-forward service/grafana 3000:3000 -n monitoring
```

### Log Aggregation (ELK Stack)

```bash
# Deploy Elasticsearch
kubectl apply -f deployment/logging/elasticsearch.yaml

# Deploy Logstash
kubectl apply -f deployment/logging/logstash.yaml

# Deploy Kibana
kubectl apply -f deployment/logging/kibana.yaml
```

### Health Monitoring

```bash
# Health check endpoint
curl http://localhost:3000/health

# Metrics endpoint
curl http://localhost:3000/metrics

# Check pod health
kubectl get pods -n treenetra
kubectl describe pod treenetra-api-xxx -n treenetra
```

## Troubleshooting

### Common Issues

#### Database Connection Failed
```bash
# Check MongoDB status
kubectl get pods -n treenetra | grep mongo

# View MongoDB logs
kubectl logs -f mongodb-0 -n treenetra

# Test connection
kubectl exec -it treenetra-api-xxx -n treenetra -- \
  node -e "require('mongoose').connect(process.env.MONGODB_URI).then(() => console.log('Connected'))"
```

#### Pod CrashLoopBackOff
```bash
# Check pod logs
kubectl logs treenetra-api-xxx -n treenetra

# Describe pod for events
kubectl describe pod treenetra-api-xxx -n treenetra

# Check resource limits
kubectl top pod treenetra-api-xxx -n treenetra
```

#### High Memory Usage
```bash
# Check pod metrics
kubectl top pods -n treenetra

# Increase memory limits
kubectl edit deployment treenetra-api -n treenetra
# Update: resources.limits.memory: "1Gi"
```

#### Slow Response Times
```bash
# Check pod count
kubectl get deployment treenetra-api -n treenetra

# Scale up
kubectl scale deployment treenetra-api --replicas=5 -n treenetra

# Enable caching
# Update Redis configuration
```

### Debug Mode

```bash
# Enable debug logging
kubectl set env deployment/treenetra-api \
  LOG_LEVEL=debug \
  --namespace=treenetra

# View real-time logs
kubectl logs -f deployment/treenetra-api -n treenetra

# Disable debug
kubectl set env deployment/treenetra-api \
  LOG_LEVEL=info \
  --namespace=treenetra
```

### Performance Tuning

```bash
# Increase worker processes
kubectl set env deployment/treenetra-api \
  NODE_OPTIONS="--max-old-space-size=2048" \
  --namespace=treenetra

# Enable cluster mode
# Update PM2 configuration in ecosystem.config.js
```

## Backup & Recovery

### Database Backup

```bash
# Manual backup
kubectl exec -it mongodb-0 -n treenetra -- \
  mongodump --uri="mongodb://localhost:27017/treenetra" \
  --archive=/tmp/backup-$(date +%Y%m%d).gz \
  --gzip

# Copy backup locally
kubectl cp treenetra/mongodb-0:/tmp/backup-20251122.gz ./backup.gz
```

### Automated Backup (Cron)

```bash
# Create backup script
kubectl create configmap backup-script \
  --from-file=deployment/scripts/backup.sh \
  --namespace=treenetra

# Create CronJob
kubectl apply -f deployment/kubernetes/backup-cronjob.yaml
```

### Restore from Backup

```bash
# Upload backup to pod
kubectl cp backup.gz treenetra/mongodb-0:/tmp/backup.gz

# Restore
kubectl exec -it mongodb-0 -n treenetra -- \
  mongorestore --uri="mongodb://localhost:27017/treenetra" \
  --archive=/tmp/backup.gz \
  --gzip
```

## Security Best Practices

1. **Use secrets management** - Never commit credentials
2. **Enable RBAC** - Restrict pod permissions
3. **Network policies** - Limit inter-pod communication
4. **Security scanning** - Scan Docker images
5. **SSL/TLS** - Always use HTTPS in production
6. **Regular updates** - Keep dependencies updated
7. **Audit logging** - Enable audit logs
8. **Rate limiting** - Protect against DDoS

## Next Steps

- [Development Workflow](DEVELOPMENT.md)
- [Testing Guide](TESTING.md)
- [API Documentation](API.md)
- [Architecture Overview](architecture/README.md)

---

**Need help?** Open an issue on [GitHub](https://github.com/Raghavendra198902/treenetra/issues)
