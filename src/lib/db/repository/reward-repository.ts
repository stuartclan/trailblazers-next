import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand
} from '@aws-sdk/lib-dynamodb';
import { getDynamoDBDocumentClient, getTableName } from '../utils/client';

import { IconNames } from '@/components/atoms/icon/icon';
import { RewardEntity } from '../entities/types';
import { nanoid } from 'nanoid';

export class RewardRepository {
  private docClient = getDynamoDBDocumentClient();
  private tableName = getTableName();

  /**
   * Create a new reward
   */
  async createReward(data: {
    count: number;
    name: string;
    icon: string;
    type: 'global' | 'host' | 'pet';
    hostId?: string;
  }): Promise<RewardEntity> {
    const id = nanoid();
    const timestamp = Math.floor(Date.now() / 1000);

    const reward: Partial<RewardEntity> = {
      pk: `REW#${id}`,
      sk: 'METADATA',
      t: 'reward',
      id,
      c: timestamp,
      u: timestamp,
      cnt: data.count,
      n: data.name,
      i: data.icon,
      rt: data.type
    };

    // Set GSI1 based on reward type
    if (data.type === 'host' && data.hostId) {
      reward.hid = data.hostId;
      reward.GSI1PK = `HOST#${data.hostId}`;
      reward.GSI1SK = `REW#${id}`;
    } else {
      // For global and pet rewards, use type-based GSI1
      reward.GSI1PK = `TYPE#reward#${data.type}`;
      reward.GSI1SK = `REW#${id}`;
    }

    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: reward
      })
    );

    return reward as RewardEntity;
  }

  /**
   * Get a reward by ID
   */
  async getRewardById(id: string): Promise<RewardEntity | null> {
    const response = await this.docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: {
          pk: `REW#${id}`,
          sk: 'METADATA'
        }
      })
    );

    return (response.Item as RewardEntity) || null;
  }

  /**
   * Get all global rewards
   */
  async getGlobalRewards(): Promise<RewardEntity[]> {
    const response = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :typeKey',
        ExpressionAttributeValues: {
          ':typeKey': 'TYPE#reward#global'
        }
      })
    );

    return (response.Items as RewardEntity[]) || [];
  }

  /**
   * Get all pet rewards
   */
  async getPetRewards(): Promise<RewardEntity[]> {
    const response = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :typeKey',
        ExpressionAttributeValues: {
          ':typeKey': 'TYPE#reward#pet'
        }
      })
    );

    return (response.Items as RewardEntity[]) || [];
  }

  /**
   * Get rewards for a specific host
   */
  async getHostRewards(hostId: string): Promise<RewardEntity[]> {
    const response = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :hostId AND begins_with(GSI1SK, :prefix)',
        ExpressionAttributeValues: {
          ':hostId': `HOST#${hostId}`,
          ':prefix': 'REW#'
        }
      })
    );

    return (response.Items as RewardEntity[]) || [];
  }

  /**
   * Update a reward
   */
  async updateReward(id: string, updateData: Partial<Omit<RewardEntity, 'pk' | 'sk' | 't' | 'id' | 'c' | 'rt' | 'GSI1PK' | 'GSI1SK'>>): Promise<RewardEntity | null> {
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
          pk: `REW#${id}`,
          sk: 'METADATA'
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ExpressionAttributeNames: expressionAttributeNames,
        ReturnValues: 'ALL_NEW'
      })
    );

    // Return the updated reward
    return this.getRewardById(id);
  }

  /**
   * Delete a reward
   */
  async deleteReward(id: string): Promise<void> {
    await this.docClient.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: {
          pk: `REW#${id}`,
          sk: 'METADATA'
        }
      })
    );
  }

  /**
   * Create default global rewards if none exist
   */
  async createDefaultGlobalRewardsIfNoneExist(): Promise<RewardEntity[]> {
    const existingGlobalRewards = await this.getGlobalRewards();

    if (existingGlobalRewards.length > 0) {
      return existingGlobalRewards;
    }

    // Define default global rewards
    const defaultGlobalRewards = [
      { count: 8, name: 'Tier 1 Reward', icon: IconNames.Shirt },
      { count: 30, name: 'Tier 2 Reward', icon: IconNames.ShirtLongSleeve },
      { count: 60, name: 'Tier 3 Reward', icon: IconNames.EmojiEvents }
    ];

    // Create all default global rewards
    const createdRewards = await Promise.all(
      defaultGlobalRewards.map(reward =>
        this.createReward({
          count: reward.count,
          name: reward.name,
          icon: reward.icon,
          type: 'global'
        })
      )
    );

    return createdRewards;
  }

  /**
   * Create default pet rewards if none exist
   */
  async createDefaultPetRewardsIfNoneExist(): Promise<RewardEntity[]> {
    const existingPetRewards = await this.getPetRewards();

    if (existingPetRewards.length > 0) {
      return existingPetRewards;
    }

    // Define default pet rewards
    const defaultPetRewards = [
      { count: 8, name: 'Pet Reward', icon: IconNames.Pets }
    ];

    // Create default pet rewards
    const createdRewards = await Promise.all(
      defaultPetRewards.map(reward =>
        this.createReward({
          count: reward.count,
          name: reward.name,
          icon: reward.icon,
          type: 'pet'
        })
      )
    );

    return createdRewards;
  }

  /**
   * Get all rewards (admin function)
   */
  async getAllRewards(): Promise<RewardEntity[]> {
    // This requires multiple queries since we have different GSI1PK patterns
    const [globalRewards, petRewards] = await Promise.all([
      this.getGlobalRewards(),
      this.getPetRewards()
    ]);

    // Note: Host rewards would need to be queried separately by host
    return [...globalRewards, ...petRewards];
  }
}
