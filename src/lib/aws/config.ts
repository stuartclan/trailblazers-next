import { CognitoIdentityProviderClient } from '@aws-sdk/client-cognito-identity-provider';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

// AWS Configuration
const AWS_REGION = process.env.AWS_REGION_NAME || 'us-east-2';

// DynamoDB Configuration
export const dynamoDBClient = new DynamoDBClient({
  region: AWS_REGION,
  ...(process.env.NODE_ENV === 'development' && process.env.DYNAMODB_ENDPOINT && {
    endpoint: process.env.DYNAMODB_ENDPOINT,
  }),
});

export const docClient = DynamoDBDocumentClient.from(dynamoDBClient, {
  marshallOptions: {
    convertEmptyValues: false,
    removeUndefinedValues: true,
    convertClassInstanceToMap: false,
  },
  unmarshallOptions: {
    wrapNumbers: false,
  },
});

// Cognito Configuration
export const cognitoClient = new CognitoIdentityProviderClient({
  region: AWS_REGION,
});

// Environment Variables
export const AWS_CONFIG = {
  region: AWS_REGION,
  dynamodb: {
    tableName: process.env.DYNAMODB_TABLE_NAME!,
    endpoint: process.env.DYNAMODB_ENDPOINT,
  },
  cognito: {
    userPoolId: process.env.COGNITO_USER_POOL_ID!,
    userPoolClientId: process.env.COGNITO_USER_POOL_CLIENT_ID!,
    // identityPoolId: process.env.COGNITO_IDENTITY_POOL_ID!,
    region: process.env.COGNITO_REGION || AWS_REGION,
  },
//   s3: {
//     bucketName: process.env.S3_BUCKET_NAME,
//     bucketUrl: process.env.S3_BUCKET_URL,
//   },
} as const;

// Validate required environment variables
export function validateAWSConfig() {
  const required = [
    'DYNAMODB_TABLE_NAME',
    'COGNITO_USER_POOL_ID', 
    'COGNITO_USER_POOL_CLIENT_ID',
    // 'COGNITO_IDENTITY_POOL_ID',
  ];

  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missing.join(', ')}\n` +
      'Make sure SST is deployed and environment variables are set.'
    );
  }
}

// Initialize AWS configuration check
if (typeof window === 'undefined') {
  // Only validate on server side
  try {
    validateAWSConfig();
  } catch (error) {
    console.warn('AWS configuration validation failed:', error);
    if (process.env.NODE_ENV === 'production') {
      throw error;
    }
  }
}