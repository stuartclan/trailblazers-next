/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  DeleteCommand,
  GetCommand,
  PutCommand,
  QueryCommand,
  UpdateCommand
} from '@aws-sdk/lib-dynamodb';
import { getDynamoDBDocumentClient, getTableName } from '../utils/client';

import { PetEntity } from '../entities/types';
import { nanoid } from 'nanoid';

export class PetRepository {
  private docClient = getDynamoDBDocumentClient();
  private tableName = getTableName();

  /**
   * Create a new pet
   */
  async createPet(data: {
    athleteId: string;
    name: string;
  }): Promise<PetEntity> {
    const id = nanoid();
    const timestamp = Math.floor(Date.now() / 1000);
    
    const pet: PetEntity = {
      pk: `PET#${id}`,
      sk: 'METADATA',
      GSI1PK: `ATH#${data.athleteId}`, // Keep this for athlete-based queries
      GSI1SK: `PET#${id}`,
      // Could use GSI2 for type-based queries if needed:
      GSI2PK: 'TYPE#pet',
      GSI2SK: `PET#${id}`,
      t: 'pet',
      id,
      c: timestamp,
      u: timestamp,
      aid: data.athleteId,
      n: data.name
    };
    
    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: pet
      })
    );
    
    return pet;
  }
  
  /**
   * Get a pet by ID
   */
  async getPetById(id: string): Promise<PetEntity | null> {
    const response = await this.docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: {
          pk: `PET#${id}`,
          sk: 'METADATA'
        }
      })
    );
    
    return (response.Item as PetEntity) || null;
  }
  
  /**
   * Get all pets for an athlete
   */
  async getPetsByAthleteId(athleteId: string): Promise<PetEntity[]> {
    const response = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: 'GSI1',
        KeyConditionExpression: 'GSI1PK = :athleteId AND begins_with(GSI1SK, :prefix)',
        ExpressionAttributeValues: {
          ':athleteId': `ATH#${athleteId}`,
          ':prefix': 'PET#'
        }
      })
    );
    
    return (response.Items as PetEntity[]) || [];
  }
  
  /**
   * Update a pet
   */
  async updatePet(id: string, updateData: Partial<Omit<PetEntity, 'pk' | 'sk' | 't' | 'id' | 'c' | 'GSI1PK' | 'GSI1SK'>>): Promise<PetEntity | null> {
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
          pk: `PET#${id}`,
          sk: 'METADATA'
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ExpressionAttributeNames: expressionAttributeNames,
        ReturnValues: 'ALL_NEW'
      })
    );
    
    // Return the updated pet
    return this.getPetById(id);
  }
  
  /**
   * Delete a pet
   */
  async deletePet(id: string): Promise<void> {
    await this.docClient.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: {
          pk: `PET#${id}`,
          sk: 'METADATA'
        }
      })
    );
    
    // Note: This doesn't delete check-ins for the pet
    // Those would need to be handled separately
  }
  
  /**
   * Get a pet by name for a specific athlete
   */
  async getPetByNameAndAthleteId(name: string, athleteId: string): Promise<PetEntity | null> {
    const pets = await this.getPetsByAthleteId(athleteId);
    
    // Look for matching name, case insensitive
    const pet = pets.find(p => p.n.toLowerCase() === name.toLowerCase());
    
    return pet || null;
  }
  
  /**
   * Check if pet exists for athlete
   */
  async petExistsForAthlete(name: string, athleteId: string): Promise<boolean> {
    const pet = await this.getPetByNameAndAthleteId(name, athleteId);
    return pet !== null;
  }
  
  /**
   * Get all pets (admin function)
   */
  async getAllPets(limit = 50, lastEvaluatedKey?: Record<string, any>): Promise<{
    pets: PetEntity[],
    lastEvaluatedKey?: Record<string, any>
  }> {
    const queryParams: any = {
      TableName: this.tableName,
      IndexName: 'GSI2',
      KeyConditionExpression: 'GSI2PK = :typeKey',
      ExpressionAttributeValues: {
        ':typeKey': 'TYPE#pet'
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
      pets: (response.Items as PetEntity[]) || [],
      lastEvaluatedKey: response.LastEvaluatedKey
    };
  }
}