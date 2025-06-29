/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand
} from '@aws-sdk/lib-dynamodb';
import { getDynamoDBDocumentClient, getTableName } from '../utils/client';

import { AthleteEntity } from '../entities/types';
import { nanoid } from 'nanoid';

export class AthleteRepository {
  private docClient = getDynamoDBDocumentClient();
  private tableName = getTableName();

  /**
   * Create a new athlete
   */
  async createAthlete(data: {
    firstName: string;
    lastName: string;
    middleInitial?: string;
    email: string;
    employer?: string;
    shirtGender?: string;
    shirtSize?: string;
    emergencyName?: string;
    emergencyPhone?: string;
    legacyCount?: number;
  }): Promise<AthleteEntity> {
    const id = nanoid();
    const timestamp = Math.floor(Date.now() / 1000);

    // Format name for GSI2 (search by name)
    const lastName = data.lastName.toUpperCase();
    const firstName = data.firstName.toUpperCase();

    const athlete: AthleteEntity = {
      pk: `ATH#${id}`,
      sk: 'METADATA',
      GSI1PK: `TYPE#athlete`,
      GSI1SK: `NAME#${lastName}#${firstName}`,
      GSI2PK: 'TYPE#athlete',
      GSI2SK: `EMAIL#${(data.email || '').toLowerCase()}`,
      t: 'athlete',
      id,
      c: timestamp,
      u: timestamp,
      fn: data.firstName,
      ln: data.lastName,
      mi: data.middleInitial || '',
      e: data.email,
      em: data.employer || '',
      sg: data.shirtGender || '',
      ss: data.shirtSize || '',
      // lc: data.legacyCount || 0,
      en: data.emergencyName || '',
      ep: data.emergencyPhone || '',
      ar: false,
      // TODO: this should default to the host they're signing up with
      ds: {},
      del: false
    };

    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: athlete
      })
    );

    return athlete;
  }

  /**
   * Get an athlete by ID
   */
  async getAthleteById(id: string): Promise<AthleteEntity | null> {
    const response = await this.docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: {
          pk: `ATH#${id}`,
          sk: 'METADATA'
        }
      })
    );

    return (response.Item as AthleteEntity) || null;
  }

  /**
   * Search athletes by last name
   */
  async searchAthletesByName(lastName: string, firstName?: string): Promise<AthleteEntity[]> {
    // Format search parameters
    lastName = lastName.toUpperCase();

    let keyCondition: string;
    let expressionValues: Record<string, any>;

    if (firstName) {
      firstName = firstName.toUpperCase();
      keyCondition = '';
      expressionValues = {
        ':nameKey': `NAME#${lastName}#${firstName}`,
        ':prefix': 'ATH#'
      };
    } else {
      keyCondition = 'GSI1PK = :type AND begins_with(GSI1SK, :namePrefix)';
      expressionValues = {
        ':type': 'TYPE#athlete',
        ':namePrefix': `NAME#${lastName}`
      };
    }

    const response = await this.docClient.send(new QueryCommand({
      TableName: this.tableName,
      IndexName: 'GSI1',
      KeyConditionExpression: keyCondition,
      ExpressionAttributeValues: expressionValues,
      // FilterExpression: 'del <> :deleted',
      // ExpressionAttributeValues: {
      //   ...expressionValues,
      //   ':deleted': true
      // }
    }));

    return (response.Items as AthleteEntity[]) || [];
  }

  /**
   * Search athletes by email
   */
  async searchAthletesByEmail(email: string): Promise<AthleteEntity[]> {
    // Format search parameters
    email = email.toLowerCase();

    const keyCondition = 'GSI2PK = :type AND begins_with(GSI2SK, :namePrefix)';
    const expressionValues = {
      ':type': 'TYPE#athlete',
      ':namePrefix': `EMAIL#${email}`
    };

    const response = await this.docClient.send(new QueryCommand({
      TableName: this.tableName,
      IndexName: 'GSI2',
      KeyConditionExpression: keyCondition,
      ExpressionAttributeValues: expressionValues,
      // FilterExpression: 'del <> :deleted',
      // ExpressionAttributeValues: {
      //   ...expressionValues,
      //   ':deleted': true
      // }
    }));

    return (response.Items as AthleteEntity[]) || [];
  }

  /**
   * Update an athlete
   */
  async updateAthlete(id: string, updateData: Partial<Omit<AthleteEntity, 'pk' | 'sk' | 't' | 'id' | 'c' | 'GSI1PK' | 'GSI1SK' | 'GSI2PK' | 'GSI2SK'>>): Promise<AthleteEntity | null> {
    // Create update expression dynamically based on provided fields
    const updateExpressionParts: string[] = ['SET u = :timestamp'];
    const expressionAttributeValues: Record<string, any> = {
      ':timestamp': Math.floor(Date.now() / 1000)
    };
    const expressionAttributeNames: Record<string, string> = {};

    // Add each provided field to the update expression
    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        updateExpressionParts.push(`#${key} = :${key}`);
        expressionAttributeValues[`:${key}`] = value;
        expressionAttributeNames[`#${key}`] = key;
      }
    });

    const updateExpression = updateExpressionParts.join(', ');

    // Run the update operation
    await this.docClient.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: {
          pk: `ATH#${id}`,
          sk: 'METADATA'
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ExpressionAttributeNames: expressionAttributeNames,
        ReturnValues: 'ALL_NEW'
      })
    );

    // Return the updated athlete
    return this.getAthleteById(id);
  }

  /**
   * Soft delete an athlete
   */
  async softDeleteAthlete(id: string): Promise<void> {
    await this.updateAthlete(id, { del: true });
  }

  /**
   * Hard delete an athlete (use with caution)
   */
  async hardDeleteAthlete(id: string): Promise<void> {
    await this.docClient.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: {
          pk: `ATH#${id}`,
          sk: 'METADATA'
        }
      })
    );
  }

  /**
   * Add host disclaimer signature to athlete
   */
  async addDisclaimerSignature(athleteId: string, hostId: string): Promise<AthleteEntity | null> {
    const timestamp = Math.floor(Date.now() / 1000);

    const athlete = await this.getAthleteById(athleteId);
    if (!athlete) return null;

    // Add hostId to disclaimer signatures if not already present
    return this.updateAthlete(athleteId, {
      ds: {
        ...athlete.ds,
        [`${hostId}`]: timestamp,
      },
    });
  }

  /**
   * Check if athlete has signed disclaimer for host
   */
  async hasSignedDisclaimer(athleteId: string, hostId: string): Promise<boolean> {
    const athlete = await this.getAthleteById(athleteId);
    if (!athlete) return false;

    return !!athlete.ds[hostId];
  }

  /**
   * Get all athletes
   * Used in admin interfaces for managing athletes
   */
  async getAllAthletes(limit = 50, lastEvaluatedKey?: Record<string, any>): Promise<{
    athletes: AthleteEntity[],
    lastEvaluatedKey?: Record<string, any>
  }> {
    const queryParams: any = {
      TableName: this.tableName,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :typeKey',
      FilterExpression: 'del <> :deleted',
      ExpressionAttributeValues: {
        ':typeKey': 'TYPE#athlete',
        // TODO: Ideally this wouldn't be a filter expression (less efficient)...
        ':deleted': true
      },
      Limit: limit
    };

    if (lastEvaluatedKey) {
      queryParams.ExclusiveStartKey = lastEvaluatedKey;
    }

    const response = await this.docClient.send(
      new QueryCommand(queryParams)
    );

    return {
      athletes: (response.Items as AthleteEntity[]) || [],
      lastEvaluatedKey: response.LastEvaluatedKey
    };
  }
}
