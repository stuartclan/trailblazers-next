# SST v3 Setup and Deployment Guide for Trailblazers

## 🚀 Quick Start

### 1. Prerequisites

```bash
# Install SST CLI globally
npm install -g sst@3

# Ensure you have AWS CLI configured
aws configure
```

### 2. Initial Setup

```bash
# Initialize SST in your project (if not already done)
sst init

# Install dependencies
pnpm install

# Copy environment file
cp .env.example .env.local
```

### 3. Development Deployment

```bash
# Deploy development stack
pnpm run deploy:dev

# Start development server with SST
pnpm run dev
```

### 4. Production Deployment

```bash
# Deploy to production
pnpm run deploy
```

## 📁 File Structure

```
├── sst.config.ts              # SST v3 configuration
├── .env.local                 # Local environment variables
├── src/
│   ├── lib/
│   │   └── aws/
│   │       └── config.ts      # AWS SDK configuration
│   └── lambda/                # Lambda functions (optional)
│       └── api.ts
└── package.json               # Updated with SST scripts
```

## 🏗️ Infrastructure Components

### Core Resources

- **DynamoDB Table**: Single-table design with GSI indexes
- **Cognito User Pool**: Authentication with email/password
- **Cognito Identity Pool**: AWS credentials for authenticated users
- **Next.js App**: Deployed using OpenNext for optimal performance
- **API Gateway**: REST API endpoints (optional)
- **S3 Bucket**: File storage for uploads
- **Lambda Functions**: Backend processing (optional)

### Monitoring & Observability

- **CloudWatch Logs**: Centralized logging
- **CloudWatch Dashboard**: Performance monitoring
- **Metrics**: Lambda and DynamoDB performance tracking

## 🔧 Configuration Details

### Environment Variables

The SST deployment automatically sets these environment variables:

```bash
# AWS Resources (auto-populated by SST)
DYNAMODB_TABLE_NAME=
COGNITO_USER_POOL_ID=
COGNITO_USER_POOL_CLIENT_ID=
# COGNITO_IDENTITY_POOL_ID=
# S3_BUCKET_NAME=
# API_URL=

# Manual Configuration
NEXTAUTH_SECRET=your-secret-here
AWS_REGION=us-east-2
```

### DynamoDB Schema

Single-table design with the following structure:

```typescript
// Primary Key
pk: string    // Partition key
sk: string    // Sort key

// Global Secondary Indexes
GSI1PK: string, GSI1SK: string  // Host-based queries
GSI2PK: string, GSI2SK: string  // Name-based queries  
GSI3PK: string, GSI3SK: string  // Date-based queries
```

### Cognito Configuration

- **Password Policy**: 8+ chars, uppercase, lowercase, numbers, symbols
- **Account Recovery**: Email-based recovery
- **OAuth Flows**: Authorization code flow for web apps
- **Token Validity**: 1 hour access/ID tokens, 30 days refresh

## 🚀 Deployment Commands

### Development

```bash
# Deploy dev stack
pnpm run deploy:dev

# Start local development with live AWS resources
pnpm run dev

# View SST console for monitoring
pnpm run sst:console

# Access SST shell for debugging
pnpm run sst:shell
```

### Production

```bash
# Deploy production stack
pnpm run deploy

# Remove development stack
pnpm run remove:dev

# Remove all resources (careful!)
pnpm run remove
```

### Monitoring

```bash
# View CloudWatch dashboard
# URL provided in deployment output

# Check logs
aws logs tail /aws/lambda/trailblazers --follow

# Monitor DynamoDB metrics
aws cloudwatch get-metric-statistics \
  --namespace AWS/DynamoDB \
  --metric-name ConsumedReadCapacityUnits \
  --dimensions Name=TableName,Value=your-table-name
```

## 🔒 Security & Permissions

### IAM Roles

SST automatically creates IAM roles with least-privilege access:

- **Lambda Execution Role**: DynamoDB and Cognito access
- **Cognito Authenticated Role**: Limited DynamoDB access
- **Cognito Unauthenticated Role**: Public read-only access

### Security Best Practices

1. **Environment Variables**: Never commit secrets to git
2. **CORS Configuration**: Restricts origins to your domain
3. **Cognito Settings**: Secure password policies and token expiration
4. **DynamoDB**: Row-level security with leading key conditions

## 🌐 Domain Configuration

### Custom Domain (Optional)

Update `sst.config.ts` to add custom domain:

```typescript
domain: {
  name: "yourdomain.com",
  dns: sst.aws.dns(),
}
```

### SSL Certificate

SST automatically provisions SSL certificates via AWS Certificate Manager.

## 📊 Monitoring & Debugging

### CloudWatch Dashboard

Access monitoring dashboard:
- Lambda function metrics (duration, errors, invocations)
- DynamoDB metrics (read/write capacity, throttling)
- API Gateway metrics (requests, latency, errors)

### Debugging

```bash
# View function logs
pnpm run sst:console

# Access Lambda environment
pnpm run sst:shell

# Local DynamoDB for development
docker run -p 8000:8000 amazon/dynamodb-local
```

## 🔄 CI/CD Integration

### GitHub Actions Example

```yaml
name: Deploy
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      - run: npm install -g sst@3
      - run: pnpm install
      - run: pnpm run deploy
        env:
          AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
          AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
```

## 🚨 Troubleshooting

### Common Issues

1. **Missing Environment Variables**
   ```bash
   # Redeploy SST stack
   pnpm run deploy:dev
   ```

2. **DynamoDB Access Errors**
   ```bash
   # Check IAM permissions in AWS Console
   # Verify table name in environment
   ```

3. **Cognito Authentication Issues**
   ```bash
   # Verify user pool configuration
   # Check client ID and pool ID
   ```

4. **Next.js Build Errors**
   ```bash
   # Clear Next.js cache
   pnpm run clean
   pnpm run build
   ```

### Getting Help

- **SST Console**: `pnpm run sst:console` for real-time debugging
- **AWS Console**: Check CloudWatch logs and metrics
- **SST Documentation**: [docs.sst.dev](https://docs.sst.dev)

## 📈 Performance Optimization

### OpenNext Configuration

- **Edge Functions**: Set `edge: true` for global performance
- **Memory Allocation**: Adjust based on usage patterns
- **Cold Start Optimization**: Use provisioned concurrency for production

### DynamoDB Optimization

- **On-Demand Billing**: Scales automatically with traffic
- **Global Secondary Indexes**: Optimized for query patterns
- **Connection Pooling**: Reuse connections in Lambda functions

## 🔐 Security Checklist

- [ ] Environment variables configured
- [ ] CORS origins restricted to your domain
- [ ] Cognito password policy enforced
- [ ] IAM roles follow least privilege
- [ ] SSL/TLS encryption enabled
- [ ] DynamoDB encryption at rest enabled
- [ ] CloudTrail logging enabled (optional)

## 🎯 Next Steps

1. **Deploy Development Stack**: `pnpm run deploy:dev`
2. **Configure Environment**: Update `.env.local` with SST outputs
3. **Test Authentication**: Verify Cognito integration
4. **Test Database**: Verify DynamoDB operations
5. **Deploy Production**: `pnpm run deploy` when ready

Your Trailblazers application is now ready for serverless deployment with SST v3! 🚀