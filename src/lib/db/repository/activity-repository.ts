import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand
} from '@aws-sdk/lib-dynamodb';
import { getDynamoDBDocumentClient, getTableName } from '../utils/client';

import { ActivityEntity } from '../entities/types';
import { ActivityIcon } from '@/lib/utils/material-icons';
import { nanoid } from 'nanoid';

export class ActivityRepository {
  private docClient = getDynamoDBDocumentClient();
  private tableName = getTableName();

  /**
   * Create a new activity
   */
  async createActivity(data: {
    name: string;
    icon: string;
    enabled?: boolean;
  }): Promise<ActivityEntity> {
    const id = nanoid();
    const timestamp = Math.floor(Date.now() / 1000);

    const activity: ActivityEntity = {
      pk: `ACT#${id}`,
      sk: 'METADATA',
      t: 'activity',
      id,
      c: timestamp,
      u: timestamp,
      n: data.name,
      i: data.icon,
      en: data.enabled !== undefined ? data.enabled : true,
      GSI1PK: 'TYPE#activity',
      GSI1SK: `ACT#${id}`
    };

    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: activity
      })
    );

    return activity;
  }
  /**
   * Get an activity by ID
   */
  async getActivityById(id: string): Promise<ActivityEntity | null> {
    const response = await this.docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: {
          pk: `ACT#${id}`,
          sk: 'METADATA'
        }
      })
    );

    return (response.Item as ActivityEntity) || null;
  }

  /**
   * Get all activities
   */
  async getAllActivities(includeDisabled = false): Promise<ActivityEntity[]> {
    const response = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :typeKey',
        ExpressionAttributeValues: {
          ':typeKey': 'TYPE#activity'
        }
      })
    );

    let activities = (response.Items as ActivityEntity[]) || [];

    // Filter out disabled activities if requested
    if (!includeDisabled) {
      activities = activities.filter(activity => activity.en);
    }

    return activities;
  }

  /**
     * Update an activity
     */
  async updateActivity(id: string, updateData: Partial<Omit<ActivityEntity, 'pk' | 'sk' | 't' | 'id' | 'c'>>): Promise<ActivityEntity | null> {
    // Create update expression dynamically based on provided fields
    const updateExpressionParts: string[] = ['SET #u = :timestamp'];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const expressionAttributeValues: Record<string, any> = {
      ':timestamp': Math.floor(Date.now() / 1000)
    };
    const expressionAttributeNames: Record<string, string> = {
      '#u': 'u' // Always include the updated timestamp
    };

    console.log('DEBUG: update activity:', updateData);

    // Add each provided field to the update expression
    Object.entries(updateData).forEach(([key, value]) => {
      if (value !== undefined) {
        // Use expression attribute names for all fields to avoid reserved word conflicts
        const attributeNamePlaceholder = `#${key}`;
        const attributeValuePlaceholder = `:${key}`;

        updateExpressionParts.push(`${attributeNamePlaceholder} = ${attributeValuePlaceholder}`);
        expressionAttributeValues[attributeValuePlaceholder] = value;
        expressionAttributeNames[attributeNamePlaceholder] = key;
      }
    });

    const updateExpression = updateExpressionParts.join(', ');

    // Run the update operation
    await this.docClient.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: {
          pk: `ACT#${id}`,
          sk: 'METADATA'
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ExpressionAttributeNames: expressionAttributeNames,
        ReturnValues: 'ALL_NEW'
      })
    );

    // Return the updated activity
    return this.getActivityById(id);
  }

  /**
   * Delete an activity
   */
  async deleteActivity(id: string): Promise<void> {
    await this.docClient.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: {
          pk: `ACT#${id}`,
          sk: 'METADATA'
        }
      })
    );
  }

  /**
   * Enable an activity
   */
  async enableActivity(id: string): Promise<ActivityEntity | null> {
    return this.updateActivity(id, { en: true });
  }

  /**
   * Disable an activity
   */
  async disableActivity(id: string): Promise<ActivityEntity | null> {
    return this.updateActivity(id, { en: false });
  }

  /**
   * Get activities by IDs
   */
  async getActivitiesByIds(ids: string[]): Promise<ActivityEntity[]> {
    if (ids.length === 0) return [];

    // Use Promise.all to make parallel requests
    const activities = await Promise.all(
      ids.map(id => this.getActivityById(id))
    );

    // Filter out any null results
    return activities.filter((activity): activity is ActivityEntity => activity !== null);
  }

  /**
   * Create default activities if none exist
   */
  async createDefaultActivitiesIfNoneExist(): Promise<ActivityEntity[]> {
    const existingActivities = await this.getAllActivities(true);

    if (existingActivities.length > 0) {
      return existingActivities;
    }

    // Define default activities
    const defaultActivities = [
      { name: 'Bike', icon: ActivityIcon.DirectionsBike },
      { name: 'Shoe', icon: ActivityIcon.DirectionsWalk },
      { name: 'Snow', icon: ActivityIcon.Ice },
      { name: 'Water', icon: ActivityIcon.Waves }
    ];

    // Create all default activities
    const createdActivities = await Promise.all(
      defaultActivities.map(activity =>
        this.createActivity({
          name: activity.name,
          icon: activity.icon,
          enabled: true
        })
      )
    );

    return createdActivities;
  }
}
