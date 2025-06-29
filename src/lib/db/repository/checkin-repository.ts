import { CheckInEntity, PetCheckInEntity } from '../entities/types';
import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand
} from '@aws-sdk/lib-dynamodb';
import { getDynamoDBDocumentClient, getTableName } from '../utils/client';

import { format } from 'date-fns';
import { nanoid } from 'nanoid';

export class CheckInRepository {
  private docClient = getDynamoDBDocumentClient();
  private tableName = getTableName();

  /**
   * Create a new check-in
   */
  async createCheckIn(data: {
    athleteId: string;
    hostId: string;
    locationId: string;
    activityId: string;
    timestamp?: number;
  }): Promise<CheckInEntity> {
    const id = nanoid();
    const timestamp = data.timestamp || Date.now();
    const dateString = format(timestamp, 'yyyy-MM-dd');

    const checkIn: CheckInEntity = {
      pk: `ATH#${data.athleteId}`,
      sk: `CI#${timestamp}`,
      GSI1PK: `HOST#${data.hostId}`,
      GSI1SK: `CI#${timestamp}`,
      GSI3PK: `DATE#${dateString}`,
      GSI3SK: `CI#${data.athleteId}`,
      t: 'checkin',
      id,
      c: timestamp, // Store as milliseconds for consistency
      u: timestamp, // Store as milliseconds for consistency
      aid: data.athleteId,
      hid: data.hostId,
      lid: data.locationId,
      actid: data.activityId
    };

    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: checkIn
      })
    );

    return checkIn;
  }

  /**
   * Create a new pet check-in
   */
  async createPetCheckIn(data: {
    athleteId: string;
    petId: string;
    hostId: string;
    locationId: string;
    timestamp?: number;
  }): Promise<PetCheckInEntity> {
    const id = nanoid();
    const timestamp = data.timestamp || Date.now();

    const petCheckIn: PetCheckInEntity = {
      pk: `PET#${data.petId}`,
      sk: `CI#${timestamp}`,
      GSI1PK: `HOST#${data.hostId}`,
      GSI1SK: `PCI#${timestamp}`,
      t: 'pet-checkin',
      id,
      c: timestamp, // Store as milliseconds for consistency
      u: timestamp, // Store as milliseconds for consistency
      aid: data.athleteId,
      pid: data.petId,
      hid: data.hostId,
      lid: data.locationId
    };

    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: petCheckIn
      })
    );

    return petCheckIn;
  }

  /**
   * Get check-ins for an athlete
   */
  async getAthleteCheckIns(athleteId: string, limit = 50): Promise<CheckInEntity[]> {
    const response = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
        ExpressionAttributeValues: {
          ':pk': `ATH#${athleteId}`,
          ':sk': 'CI#'
        },
        ScanIndexForward: false, // Get most recent first
        Limit: limit
      })
    );

    return (response.Items as CheckInEntity[]) || [];
  }

  /**
   * Get check-ins for a pet
   */
  async getPetCheckIns(petId: string, limit = 50): Promise<PetCheckInEntity[]> {
    const response = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
        ExpressionAttributeValues: {
          ':pk': `PET#${petId}`,
          ':sk': 'CI#'
        },
        ScanIndexForward: false, // Get most recent first
        Limit: limit
      })
    );

    return (response.Items as PetCheckInEntity[]) || [];
  }

  /**
   * Get check-ins for a host (most recent first)
   */
  async getHostCheckIns(hostId: string, limit = 50): Promise<CheckInEntity[]> {
    const response = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :hk AND begins_with(GSI1SK, :sk)',
        ExpressionAttributeValues: {
          ':hk': `HOST#${hostId}`,
          ':sk': 'CI#'
        },
        ScanIndexForward: false, // Get most recent first
        Limit: limit
      })
    );

    return (response.Items as CheckInEntity[]) || [];
  }

  /**
   * Get pet check-ins for a host (most recent first)
   */
  async getHostPetCheckIns(hostId: string, limit = 50): Promise<PetCheckInEntity[]> {
    const response = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :hk AND begins_with(GSI1SK, :sk)',
        ExpressionAttributeValues: {
          ':hk': `HOST#${hostId}`,
          ':sk': 'PCI#'
        },
        ScanIndexForward: false, // Get most recent first
        Limit: limit
      })
    );

    return (response.Items as PetCheckInEntity[]) || [];
  }

  /**
   * Get check-ins for a specific date
   */
  async getCheckInsByDate(dateString: string, limit = 100): Promise<CheckInEntity[]> {
    const response = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: 'GSI3',
        KeyConditionExpression: 'GSI3PK = :date',
        ExpressionAttributeValues: {
          ':date': `DATE#${dateString}`
        },
        Limit: limit
      })
    );

    return (response.Items as CheckInEntity[]) || [];
  }

  /**
   * Get athlete check-ins by host in a date range
   */
  async getAthleteCheckInsByHostInDateRange(
    athleteId: string,
    hostId: string,
    startTimestamp: number,
    endTimestamp: number
  ): Promise<CheckInEntity[]> {
    const response = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: 'pk = :pk AND sk BETWEEN :start AND :end',
        FilterExpression: 'hid = :hid',
        ExpressionAttributeValues: {
          ':pk': `ATH#${athleteId}`,
          ':start': `CI#${startTimestamp}`,
          ':end': `CI#${endTimestamp}`,
          ':hid': hostId
        }
      })
    );

    return (response.Items as CheckInEntity[]) || [];
  }

  /**
   * Get the count of check-ins for an athlete
   */
  async getAthleteCheckInCount(athleteId: string): Promise<number> {
    // Note: This is not the most efficient way to get a count in DynamoDB
    // For a high-scale app, consider using a counter or calculating this another way
    const checkIns = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
        ExpressionAttributeValues: {
          ':pk': `ATH#${athleteId}`,
          ':sk': 'CI#',
        },
        Select: 'COUNT'
      })
    );

    return checkIns.Count || 0;
  }

  /**
   * Get the count of check-ins for an athlete at a specific host
   */
  async getAthleteCheckInCountByHost(athleteId: string, hostId: string): Promise<number> {
    // Note: This is not the most efficient way to get a count in DynamoDB
    // For a high-scale app, consider using a counter or calculating this another way
    const checkIns = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
        FilterExpression: 'hid = :hid',
        ExpressionAttributeValues: {
          ':pk': `ATH#${athleteId}`,
          ':sk': 'CI#',
          ':hid': hostId
        },
        Select: 'COUNT'
      })
    );

    return checkIns.Count || 0;
  }

  /**
   * Get athlete's most recent check-in
   */
  async getAthleteLatestCheckIn(athleteId: string): Promise<CheckInEntity | null> {
    const response = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
        ExpressionAttributeValues: {
          ':pk': `ATH#${athleteId}`,
          ':sk': 'CI#'
        },
        ScanIndexForward: false, // Get most recent first
        Limit: 1
      })
    );

    if (!response.Items || response.Items.length === 0) {
      return null;
    }

    return response.Items[0] as CheckInEntity;
  }

  /**
   * Check if athlete has checked in at a host within a week
   */
  async hasCheckedInAtHostWithinWeek(athleteId: string, hostId: string): Promise<boolean> {
    const oneWeekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);

    const response = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: 'pk = :pk AND sk > :oneWeekAgo',
        FilterExpression: 'hid = :hid',
        ExpressionAttributeValues: {
          ':pk': `ATH#${athleteId}`,
          ':oneWeekAgo': `CI#${oneWeekAgo}`,
          ':hid': hostId
        },
        Limit: 1
      })
    );

    return (!!response.Items?.length);
  }

  /**
   * Get a specific check-in by athlete ID and timestamp
   */
  async getCheckIn(athleteId: string, timestampMs: number): Promise<CheckInEntity | null> {
    const response = await this.docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: {
          pk: `ATH#${athleteId}`,
          sk: `CI#${timestampMs}`
        }
      })
    );

    return (response.Item as CheckInEntity) || null;
  }

  /**
   * Extract timestamp from sort key
   * Helper method to get timestamp from existing records that might have different formats
   */
  extractTimestampFromSK(sk: string): number {
    // Remove "CI#" prefix to get the timestamp
    return parseInt(sk.replace('CI#', ''));
  }

  /**
   * Update a check-in (change activity and optionally timestamp)
   */
  async updateCheckIn(
    athleteId: string,
    timestamp: number,
    updateData: {
      activityId?: string;
      // newTimestamp?: number;
    }
  ): Promise<CheckInEntity | null> {
    // First, get the existing check-in
    const existingCheckIn = await this.getCheckIn(athleteId, timestamp);
    if (!existingCheckIn) {
      return null;
    }

    // Just update the activity if no timestamp change
    if (!updateData.activityId) {
      return existingCheckIn; // Nothing to update
    }

    const test = await this.docClient.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: {
          pk: `ATH#${athleteId}`,
          sk: `CI#${timestamp}`
        },
        UpdateExpression: 'SET actid = :actid, u = :updated',
        ExpressionAttributeValues: {
          ':actid': updateData.activityId,
          ':updated': Date.now() // Update timestamp in milliseconds
        },
        ReturnValues: 'ALL_NEW'
      })
    );

    // Return the updated check-in
    return this.getCheckIn(athleteId, timestamp);
  }

  // /**
  //  * Update a check-in (change activity and optionally timestamp)
  //  */
  // async updateCheckIn(
  //   athleteId: string,
  //   currentTimestampMs: number,
  //   updateData: {
  //     activityId?: string;
  //     newTimestamp?: number;
  //   }
  // ): Promise<CheckInEntity | null> {
  //   // First, get the existing check-in
  //   const existingCheckIn = await this.getCheckIn(athleteId, currentTimestampMs);
  //   if (!existingCheckIn) {
  //     return null;
  //   }

  //   // If we're updating the timestamp, we need to delete the old item and create a new one
  //   // because timestamp is part of the sort key
  //   if (updateData.newTimestamp && updateData.newTimestamp !== currentTimestampMs) {
  //     // Delete the old check-in
  //     await this.deleteCheckIn(athleteId, currentTimestampMs);

  //     // Create new check-in with updated data
  //     const newTimestamp = updateData.newTimestamp;
  //     const dateString = format(newTimestamp, 'yyyy-MM-dd');

  //     const updatedCheckIn: CheckInEntity = {
  //       ...existingCheckIn,
  //       sk: `CI#${newTimestamp}`,
  //       GSI1SK: `CI#${newTimestamp}`,
  //       GSI3PK: `DATE#${dateString}`,
  //       c: newTimestamp, // Keep as milliseconds
  //       u: Date.now(), // Update timestamp in milliseconds
  //       actid: updateData.activityId || existingCheckIn.actid
  //     };

  //     await this.docClient.send(
  //       new PutCommand({
  //         TableName: this.tableName,
  //         Item: updatedCheckIn
  //       })
  //     );

  //     return updatedCheckIn;
  //   } else {
  //     // Just update the activity if no timestamp change
  //     if (!updateData.activityId) {
  //       return existingCheckIn; // Nothing to update
  //     }

  //     await this.docClient.send(
  //       new UpdateCommand({
  //         TableName: this.tableName,
  //         Key: {
  //           pk: `ATH#${athleteId}`,
  //           sk: `CI#${currentTimestampMs}`
  //         },
  //         UpdateExpression: 'SET actid = :actid, u = :updated',
  //         ExpressionAttributeValues: {
  //           ':actid': updateData.activityId,
  //           ':updated': Date.now() // Update timestamp in milliseconds
  //         },
  //         ReturnValues: 'ALL_NEW'
  //       })
  //     );

  //     // Return the updated check-in
  //     return this.getCheckIn(athleteId, currentTimestampMs);
  //   }
  // }

  /**
   * Delete a check-in
   * @param athleteId - The athlete ID
   * @param timestampMs - The timestamp in milliseconds (as stored in SK)
   */
  async deleteCheckIn(athleteId: string, timestampMs: number): Promise<void> {
    await this.docClient.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: {
          pk: `ATH#${athleteId}`,
          sk: `CI#${timestampMs}`
        }
      })
    );
  }

  /**
   * Delete a pet check-in
   * @param petId - The pet ID
   * @param timestampMs - The timestamp in milliseconds (as stored in SK)
   */
  async deletePetCheckIn(petId: string, timestampMs: number): Promise<void> {
    await this.docClient.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: {
          pk: `PET#${petId}`,
          sk: `CI#${timestampMs}`
        }
      })
    );
  }
}
