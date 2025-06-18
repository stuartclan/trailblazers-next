import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand
} from '@aws-sdk/lib-dynamodb';
import { getDynamoDBDocumentClient, getTableName } from '../utils/client';

import { HostEntity } from '../entities/types';
import { nanoid } from 'nanoid';

export class HostRepository {
  private docClient = getDynamoDBDocumentClient();
  private tableName = getTableName();

  /**
   * Create a new host
   */
  async createHost(hostData: {
    hostId: string;
    name: string;
    cognitoId: string;
    password: string;
    disclaimer?: string;
  }): Promise<HostEntity> {
    const timestamp = Math.floor(Date.now() / 1000);

    const host: HostEntity = {
      pk: `HOST#${hostData.hostId}`,
      sk: 'METADATA',
      t: 'host',
      id: hostData.hostId,
      c: timestamp,
      u: timestamp,
      n: hostData.name,
      cid: hostData.cognitoId,
      p: hostData.password,
      lids: [],
      disc: hostData.disclaimer || '',
      cr: [],
      GSI1PK: 'TYPE#host',
      GSI1SK: `COGNITO#${hostData.cognitoId}`
    };

    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: host
      })
    );

    return host;
  }

  /**
   * Get a host by ID
   */
  async getHostById(id: string): Promise<HostEntity | null> {
    const response = await this.docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: {
          pk: `HOST#${id}`,
          sk: 'METADATA'
        }
      })
    );

    return (response.Item as HostEntity) || null;
  }

  /**
   * Get all hosts
   */
  async getAllHosts(): Promise<HostEntity[]> {
    const response = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :typeKey',
        ExpressionAttributeValues: {
          ':typeKey': 'TYPE#host'
        }
      })
    );

    return (response.Items as HostEntity[]) || [];
  }

  /**
   * Update a host
   */
  async updateHost(id: string, updateData: Partial<Omit<HostEntity, 'pk' | 'sk' | 't' | 'id' | 'c'>>): Promise<HostEntity | null> {
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
          pk: `HOST#${id}`,
          sk: 'METADATA'
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ExpressionAttributeNames: expressionAttributeNames,
        ReturnValues: 'ALL_NEW'
      })
    );

    // Return the updated host
    return this.getHostById(id);
  }

  /**
   * Delete a host
   */
  async deleteHost(id: string): Promise<void> {
    // TODO: Delete locations associated with host
    await this.docClient.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: {
          pk: `HOST#${id}`,
          sk: 'METADATA'
        }
      })
    );
  }

  /**
   * Get a host by Cognito ID
   */
  async getHostByCognitoId(cognitoId: string): Promise<HostEntity | null> {
    const response = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :typeKey AND GSI1SK = :cognitoId',
        ExpressionAttributeValues: {
          ':typeKey': 'TYPE#host',
          ':cognitoId': `COGNITO#${cognitoId}`,
        }
      })
    );

    if (!response?.Items?.length) {
      return null;
    }

    return (response.Items[0] as HostEntity) || null;
  }

  /**
   * Add a custom reward to a host
   */
  async addCustomReward(hostId: string, rewardData: {
    count: number;
    name: string;
    icon: string;
  }): Promise<HostEntity | null> {
    const host = await this.getHostById(hostId);
    if (!host) return null;

    const newReward = {
      id: nanoid(),
      c: rewardData.count,
      n: rewardData.name,
      i: rewardData.icon
    };

    const updatedHost = await this.updateHost(hostId, {
      cr: [...(host.cr || []), newReward]
    });

    return updatedHost;
  }

  /**
   * Remove a custom reward from a host
   */
  async removeCustomReward(hostId: string, rewardId: string): Promise<HostEntity | null> {
    const host = await this.getHostById(hostId);
    if (!host || !host.cr) return null;

    const updatedRewards = host.cr.filter(reward => reward.id !== rewardId);

    const updatedHost = await this.updateHost(hostId, {
      cr: updatedRewards
    });

    return updatedHost;
  }

  /**
   * Add a location to a host
   */
  async addLocationToHost(hostId: string, locationId: string): Promise<HostEntity | null> {
    const host = await this.getHostById(hostId);
    if (!host) return null;

    const updatedLocations = [...new Set([...(host.lids || []), locationId])];

    const updatedHost = await this.updateHost(hostId, {
      lids: updatedLocations
    });

    return updatedHost;
  }

  /**
   * Remove a location from a host
   */
  async removeLocationFromHost(hostId: string, locationId: string): Promise<HostEntity | null> {
    const host = await this.getHostById(hostId);
    if (!host) return null;

    const updatedLocations = (host.lids || []).filter(id => id !== locationId);

    const updatedHost = await this.updateHost(hostId, {
      lids: updatedLocations
    });

    return updatedHost;
  }
}