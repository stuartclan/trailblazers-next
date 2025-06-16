import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand
} from '@aws-sdk/lib-dynamodb';
import { getDynamoDBDocumentClient, getTableName } from '../utils/client';

import { LocationEntity } from '../entities/types';
import { nanoid } from 'nanoid';

export class LocationRepository {
  private docClient = getDynamoDBDocumentClient();
  private tableName = getTableName();

  /**
   * Create a new location
   */
  async createLocation(data: {
    hostId: string;
    name: string;
    address: string;
    activityIds?: string[];
  }): Promise<LocationEntity> {
    const id = nanoid();
    const timestamp = Math.floor(Date.now() / 1000);
    
    const location: LocationEntity = {
      pk: `LOC#${id}`,
      sk: 'METADATA',
      GSI1PK: `HOST#${data.hostId}`,
      GSI1SK: `LOC#${id}`,
      t: 'location',
      id,
      c: timestamp,
      u: timestamp,
      hid: data.hostId,
      n: data.name,
      a: data.address,
      acts: data.activityIds || []
    };
    
    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: location
      })
    );
    
    return location;
  }
  
  /**
   * Get a location by ID
   */
  async getLocationById(id: string): Promise<LocationEntity | null> {
    const response = await this.docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: {
          pk: `LOC#${id}`,
          sk: 'METADATA'
        }
      })
    );
    
    return (response.Item as LocationEntity) || null;
  }
  
  /**
   * Get all locations for a host
   */
  async getLocationsByHostId(hostId: string): Promise<LocationEntity[]> {
    const response = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :hostId AND begins_with(GSI1SK, :prefix)',
        ExpressionAttributeValues: {
          ':hostId': `HOST#${hostId}`,
          ':prefix': 'LOC#'
        }
      })
    );
    
    return (response.Items as LocationEntity[]) || [];
  }
  
  /**
   * Update a location
   */
  async updateLocation(id: string, updateData: Partial<Omit<LocationEntity, 'pk' | 'sk' | 't' | 'id' | 'c' | 'GSI1PK' | 'GSI1SK'>>): Promise<LocationEntity | null> {
    // Create update expression dynamically based on provided fields
    const updateExpressionParts: string[] = ['SET u = :timestamp'];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
          pk: `LOC#${id}`,
          sk: 'METADATA'
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ExpressionAttributeNames: expressionAttributeNames,
        ReturnValues: 'ALL_NEW'
      })
    );
    
    // Return the updated location
    return this.getLocationById(id);
  }
  
  /**
   * Delete a location
   */
  async deleteLocation(id: string): Promise<void> {
    await this.docClient.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: {
          pk: `LOC#${id}`,
          sk: 'METADATA'
        }
      })
    );
  }
  
  /**
   * Add an activity to a location
   */
  async addActivityToLocation(locationId: string, activityId: string): Promise<LocationEntity | null> {
    const location = await this.getLocationById(locationId);
    if (!location) return null;
    
    // Add activity if not already present
    if (!location.acts.includes(activityId)) {
      const updatedActs = [...location.acts, activityId];
      return this.updateLocation(locationId, { acts: updatedActs });
    }
    
    return location;
  }
  
  /**
   * Remove an activity from a location
   */
  async removeActivityFromLocation(locationId: string, activityId: string): Promise<LocationEntity | null> {
    const location = await this.getLocationById(locationId);
    if (!location) return null;
    
    const updatedActs = location.acts.filter(id => id !== activityId);
    return this.updateLocation(locationId, { acts: updatedActs });
  }
  
  /**
   * Update activities for a location
   */
  async updateLocationActivities(locationId: string, activityIds: string[]): Promise<LocationEntity | null> {
    return this.updateLocation(locationId, { acts: activityIds });
  }
  
  /**
   * Get all locations
   */
  async getAllLocations(): Promise<LocationEntity[]> {
    const response = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :typeKey',
        ExpressionAttributeValues: {
          ':typeKey': 'TYPE#location'
        }
      })
    );
    
    return (response.Items as LocationEntity[]) || [];
  }
}