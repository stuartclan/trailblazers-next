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
import { CheckInHelper } from '@/lib/utils/helpers/checkin';
import { nanoid } from 'nanoid';

// Add default values for optimization properties if they don't exist
// This handles existing athletes created before these properties were added
const defaultCheckInValues = (athlete: AthleteEntity) => {
  return {
    ...athlete,
    gc: athlete.gc ?? 0, // Start with 0 global check-ins
    lw: athlete.lw ?? {}, // Start with no weekly check-ins
  };
};

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
      en: data.emergencyName || '',
      ep: data.emergencyPhone || '',
      gc: 0, // Start with 0 global check-ins
      lw: {}, // Start with no weekly check-ins
      // lc: data.legacyCount || 0,
      ar: false,
      // TODO: this should default to the host they're signing up with
      ds: {},
      del: false,
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
   * Get an athlete by ID with default values for optimization properties
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

    if (!response.Item) return null;

    return defaultCheckInValues(response.Item as AthleteEntity);
  }

  /**
   * Search athletes by last name with default optimization properties
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
      FilterExpression: 'del <> :deleted',
      // ExpressionAttributeValues: expressionValues,
      ExpressionAttributeValues: {
        ...expressionValues,
        ':deleted': true
      }
    }));

    const athletes = (response.Items as AthleteEntity[]) || [];

    return athletes.map(defaultCheckInValues);
  }

  /**
   * Search athletes by email with default optimization properties
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
      //FilterExpression ExpressionAttributeValues: expressionValues,
      FilterExpression: 'del <> :deleted',
      ExpressionAttributeValues: {
        ...expressionValues,
        ':deleted': true
      }
    }));

    const athletes = (response.Items as AthleteEntity[]) || [];

    return athletes.map(defaultCheckInValues);
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
   * Update athlete's optimization properties after check-in
   */
  async updateAfterCheckIn(
    athleteId: string,
    hostId: string,
    checkInTimestamp: number,
    activityId: string,
    shouldIncrementGlobalCount: boolean
  ): Promise<AthleteEntity | null> {
    // Get current athlete to merge with existing lw data
    const currentAthlete = await this.getAthleteById(athleteId);
    if (!currentAthlete) return null;

    const lwValue = `${checkInTimestamp}#${activityId}`;
    const newGc = shouldIncrementGlobalCount ? (currentAthlete.gc || 0) + 1 : (currentAthlete.gc || 0);

    return this.updateAthlete(athleteId, {
      gc: newGc,
      lw: {
        ...(!CheckInHelper.shouldIncrementGlobalCount(currentAthlete) ? currentAthlete.lw : {}),
        [hostId]: lwValue
      }
    });
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

    const athletes = (response.Items as AthleteEntity[]) || [];

    // Add default values for optimization properties
    const athletesWithDefaults = athletes.map(defaultCheckInValues);

    return {
      athletes: athletesWithDefaults,
      lastEvaluatedKey: response.LastEvaluatedKey
    };
  }
}
