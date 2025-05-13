import { CheckInEntity, PetCheckInEntity } from '../entities/types';
import {
  DeleteCommand,
  PutCommand,
  QueryCommand
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
      c: Math.floor(timestamp / 1000),
      u: Math.floor(timestamp / 1000),
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
      c: Math.floor(timestamp / 1000),
      u: Math.floor(timestamp / 1000),
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
   * Delete a check-in
   */
  async deleteCheckIn(athleteId: string, timestamp: number): Promise<void> {
    await this.docClient.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: {
          pk: `ATH#${athleteId}`,
          sk: `CI#${timestamp}`
        }
      })
    );
  }
  
  /**
   * Delete a pet check-in
   */
  async deletePetCheckIn(petId: string, timestamp: number): Promise<void> {
    await this.docClient.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: {
          pk: `PET#${petId}`,
          sk: `CI#${timestamp}`
        }
      })
    );
  }
}