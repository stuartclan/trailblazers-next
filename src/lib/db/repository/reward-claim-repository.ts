import {
  DeleteCommand,
  PutCommand,
  QueryCommand
} from '@aws-sdk/lib-dynamodb';
import { getDynamoDBDocumentClient, getTableName } from '../utils/client';

import { RewardClaimEntity } from '../entities/types';
import { nanoid } from 'nanoid';

export class RewardClaimRepository {
  private docClient = getDynamoDBDocumentClient();
  private tableName = getTableName();

  /**
   * Create a new reward claim
   */
  async createRewardClaim(data: {
    athleteId: string;
    rewardId: string;
    hostId: string;
    locationId: string;
    petId?: string;
    timestamp?: number;
  }): Promise<RewardClaimEntity> {
    const id = nanoid();
    const timestamp = data.timestamp || Date.now();
    
    const rewardClaim: RewardClaimEntity = {
      pk: `ATH#${data.athleteId}`,
      sk: `RC#${timestamp}#${data.rewardId}`,
      GSI1PK: `HOST#${data.hostId}`,
      GSI1SK: `RC#${timestamp}`,
      t: 'reward-claim',
      id,
      c: Math.floor(timestamp / 1000),
      u: Math.floor(timestamp / 1000),
      aid: data.athleteId,
      rid: data.rewardId,
      hid: data.hostId,
      lid: data.locationId
    };
    
    // Add pet ID if this is a pet reward
    if (data.petId) {
      rewardClaim.pid = data.petId;
    }
    
    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: rewardClaim
      })
    );
    
    return rewardClaim;
  }
  
  /**
   * Get reward claims for an athlete
   */
  async getAthleteRewardClaims(athleteId: string): Promise<RewardClaimEntity[]> {
    const response = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: 'pk = :pk AND begins_with(sk, :sk)',
        ExpressionAttributeValues: {
          ':pk': `ATH#${athleteId}`,
          ':sk': 'RC#'
        },
        ScanIndexForward: false // Most recent first
      })
    );
    
    return (response.Items as RewardClaimEntity[]) || [];
  }
  
  /**
   * Get reward claims for a host
   */
  async getHostRewardClaims(hostId: string, limit = 50): Promise<RewardClaimEntity[]> {
    const response = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :hostId AND begins_with(GSI1SK, :prefix)',
        ExpressionAttributeValues: {
          ':hostId': `HOST#${hostId}`,
          ':prefix': 'RC#'
        },
        ScanIndexForward: false, // Most recent first
        Limit: limit
      })
    );
    
    return (response.Items as RewardClaimEntity[]) || [];
  }
  
  /**
   * Get reward claims for a specific reward
   */
  async getClaimsByRewardId(rewardId: string): Promise<RewardClaimEntity[]> {
    // This is not efficient in DynamoDB as we need to scan all reward claims
    // For high-scale, we might want to create an additional GSI for this
    const response = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        FilterExpression: 'rid = :rewardId',
        ExpressionAttributeValues: {
          ':rewardId': rewardId
        },
        ScanIndexForward: false // Most recent first
      })
    );
    
    return (response.Items as RewardClaimEntity[]) || [];
  }
  
  /**
   * Check if athlete has claimed a specific reward
   */
  async hasAthleteClaimedReward(athleteId: string, rewardId: string): Promise<boolean> {
    const claims = await this.getAthleteRewardClaims(athleteId);
    return claims.some(claim => claim.rid === rewardId);
  }
  
  /**
   * Delete a reward claim
   */
  async deleteRewardClaim(athleteId: string, timestamp: number, rewardId: string): Promise<void> {
    await this.docClient.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: {
          pk: `ATH#${athleteId}`,
          sk: `RC#${timestamp}#${rewardId}`
        }
      })
    );
  }
  
  /**
   * Get recent reward claims for a host (for the "One-Aways" functionality)
   * Returns claims from the last day
   */
  async getRecentHostRewardClaims(hostId: string): Promise<RewardClaimEntity[]> {
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    
    const response = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :hostId AND GSI1SK > :oneDayAgo',
        ExpressionAttributeValues: {
          ':hostId': `HOST#${hostId}`,
          ':oneDayAgo': `RC#${oneDayAgo}`
        },
        ScanIndexForward: false // Most recent first
      })
    );
    
    return (response.Items as RewardClaimEntity[]) || [];
  }
  
  /**
   * Get all pet reward claims for an athlete
   */
  async getAthletePetRewardClaims(athleteId: string): Promise<RewardClaimEntity[]> {
    const claims = await this.getAthleteRewardClaims(athleteId);
    return claims.filter(claim => claim.pid !== undefined);
  }
  
  /**
   * Get all reward claims (admin function)
   */
  async getAllRewardClaims(limit = 100): Promise<RewardClaimEntity[]> {
    // This is not efficient in DynamoDB and should be used only for admin purposes
    const response = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        FilterExpression: 't = :type',
        ExpressionAttributeValues: {
          ':type': 'reward-claim'
        },
        ScanIndexForward: false, // Most recent first
        Limit: limit
      })
    );
    
    return (response.Items as RewardClaimEntity[]) || [];
  }
}