import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

let dynamoDbClient: DynamoDBClient | null = null;
let docClient: DynamoDBDocumentClient | null = null;

export function getDynamoDBClient(): DynamoDBClient {
  if (!dynamoDbClient) {
    dynamoDbClient = new DynamoDBClient({
      region: process.env.AWS_REGION_NAME || 'us-east-2',
    });
  }
  return dynamoDbClient;
}

export function getDynamoDBDocumentClient(): DynamoDBDocumentClient {
  if (!docClient) {
    const client = getDynamoDBClient();
    docClient = DynamoDBDocumentClient.from(client, {
      marshallOptions: {
        removeUndefinedValues: true,
      },
    });
  }
  return docClient;
}

export const getTableName = (): string => {
  const tableName = process.env.DYNAMODB_TABLE_NAME;
  if (!tableName) {
    throw new Error('TABLE_NAME environment variable is not set');
  }
  return tableName;
};