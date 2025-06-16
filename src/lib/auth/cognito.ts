import {
  AddCustomAttributesCommand,
  AdminAddUserToGroupCommand,
  AdminCreateUserCommand,
  AdminDeleteUserCommand,
  AdminGetUserCommand,
  AdminInitiateAuthCommand,
  AdminListGroupsForUserCommand,
  AdminRemoveUserFromGroupCommand,
  AdminSetUserPasswordCommand,
  AdminUpdateUserAttributesCommand,
  AttributeType,
  AuthFlowType,
  CognitoIdentityProviderClient,
  CreateGroupCommand,
  DeleteGroupCommand,
  ListGroupsCommand,
  ListUsersCommand,
  SchemaAttributeType
} from '@aws-sdk/client-cognito-identity-provider';

// Constants
const USER_POOL_ID = process.env.COGNITO_USER_POOL_ID;
const USER_POOL_CLIENT_ID = process.env.COGNITO_USER_POOL_CLIENT_ID;
const REGION = process.env.REGION || 'us-east-1';

if (!USER_POOL_ID) {
  throw new Error('USER_POOL_ID environment variable is not set');
}

if (!USER_POOL_CLIENT_ID) {
  throw new Error('USER_POOL_CLIENT_ID environment variable is not set');
}

// Initialize Cognito client
const cognitoClient = new CognitoIdentityProviderClient({ region: REGION });

/**
 * Create a host user in Cognito
 */
export async function createHostUser(email: string, tempPassword: string, hostName: string) {
  try {
    // Create the user
    const createUserCommand = new AdminCreateUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: email,
      TemporaryPassword: tempPassword,
      MessageAction: 'SUPPRESS', // Don't send welcome email
      UserAttributes: [
        {
          Name: 'email',
          Value: email
        },
        {
          Name: 'email_verified',
          Value: 'true'
        },
        {
          Name: 'custom:hostName',
          Value: hostName
        }
      ]
    });

    const createUserResult = await cognitoClient.send(createUserCommand);

    // Set a permanent password (if needed)
    // This step is optional if you want users to change their own password
    const setPasswordCommand = new AdminSetUserPasswordCommand({
      UserPoolId: USER_POOL_ID,
      Username: email,
      Password: tempPassword,
      Permanent: true
    });

    await cognitoClient.send(setPasswordCommand);

    // Add user to 'hosts' group
    const addToGroupCommand = new AdminAddUserToGroupCommand({
      UserPoolId: USER_POOL_ID,
      Username: email,
      GroupName: 'hosts'
    });

    await cognitoClient.send(addToGroupCommand);

    return {
      success: true,
      user: createUserResult.User
    };
  } catch (error) {
    console.error('Error creating Cognito user:', error);
    return {
      success: false,
      error
    };
  }
}

/**
 * Create a super-admin user in Cognito
 */
export async function createSuperAdminUser(email: string, tempPassword: string) {
  try {
    // Create the user
    const createUserCommand = new AdminCreateUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: email,
      TemporaryPassword: tempPassword,
      MessageAction: 'SUPPRESS', // Don't send welcome email
      UserAttributes: [
        {
          Name: 'email',
          Value: email
        },
        {
          Name: 'email_verified',
          Value: 'true'
        }
      ]
    });

    const createUserResult = await cognitoClient.send(createUserCommand);

    // Set a permanent password (if needed)
    const setPasswordCommand = new AdminSetUserPasswordCommand({
      UserPoolId: USER_POOL_ID,
      Username: email,
      Password: tempPassword,
      Permanent: true
    });

    await cognitoClient.send(setPasswordCommand);

    // Add user to 'super-admins' group
    const addToGroupCommand = new AdminAddUserToGroupCommand({
      UserPoolId: USER_POOL_ID,
      Username: email,
      GroupName: 'super-admins'
    });

    await cognitoClient.send(addToGroupCommand);

    return {
      success: true,
      user: createUserResult.User
    };
  } catch (error) {
    console.error('Error creating super-admin user:', error);
    return {
      success: false,
      error
    };
  }
}

/**
 * Delete a user from Cognito
 */
export async function deleteUser(username: string) {
  try {
    const command = new AdminDeleteUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: username
    });

    await cognitoClient.send(command);
    return { success: true };
  } catch (error) {
    console.error('Error deleting Cognito user:', error);
    return {
      success: false,
      error
    };
  }
}

/**
 * Update a user's attributes in Cognito
 */
export async function updateUserAttributes(username: string, attributes: Record<string, string>) {
  try {
    // Format attributes for Cognito
    const userAttributes = Object.entries(attributes).map(([name, value]) => ({
      Name: name.startsWith('custom:') ? name : name === 'email' ? 'email' : `custom:${name}`,
      Value: value
    }));

    const command = new AdminUpdateUserAttributesCommand({
      UserPoolId: USER_POOL_ID,
      Username: username,
      UserAttributes: userAttributes
    });

    await cognitoClient.send(command);
    return { success: true };
  } catch (error) {
    console.error('Error updating user attributes:', error);
    return {
      success: false,
      error
    };
  }
}

/**
 * List all users in a Cognito user pool
 */
export async function listUsers(limit = 60, paginationToken?: string) {
  try {
    const command = new ListUsersCommand({
      UserPoolId: USER_POOL_ID,
      Limit: limit,
      PaginationToken: paginationToken
    });

    const response = await cognitoClient.send(command);
    
    return {
      success: true,
      users: response.Users || [],
      paginationToken: response.PaginationToken
    };
  } catch (error) {
    console.error('Error listing Cognito users:', error);
    return {
      success: false,
      error
    };
  }
}

/**
 * List all users in a specific Cognito group
 */
export async function listUsersInGroup(groupName: string, limit = 60, nextToken?: string) {
  try {
    // For simplicity, we'll just list all users and filter by group
    // TODO: Follow the suggestion below to use AdminListUsersInGroupCommand
    // In a production environment, use the AdminListUsersInGroupCommand for better performance
    const users = await listUsers(limit, nextToken);
    
    if (!users?.success) return users;
    
    // Filter users by checking if they're in the specified group
    const filteredUsers = [];
    
    if (users?.users) {
        for (const user of users.users) {
          // TODO: Don't like this loop making a cognito call for each user...?
          const groupsResponse = await cognitoClient.send(
            new AdminListGroupsForUserCommand({
              UserPoolId: USER_POOL_ID,
              Username: user.Username!
            })
          );
          
          const userGroups = groupsResponse.Groups || [];
          if (userGroups.some(group => group.GroupName === groupName)) {
            filteredUsers.push(user);
          }
        }
    }
    
    return {
      success: true,
      users: filteredUsers,
      paginationToken: users.paginationToken
    };
  } catch (error) {
    console.error(`Error listing users in group '${groupName}':`, error);
    return {
      success: false,
      error
    };
  }
}

/**
 * Create Cognito groups if they don't exist
 */
export async function createDefaultCognitoGroups() {
  const requiredGroups = ['hosts', 'super-admins'];
  
  try {
    // Get existing groups
    const listGroupsCommand = new ListGroupsCommand({
      UserPoolId: USER_POOL_ID
    });
    
    const existingGroups = await cognitoClient.send(listGroupsCommand);
    const existingGroupNames = (existingGroups.Groups || []).map(g => g.GroupName);
    
    // Create any missing groups
    for (const groupName of requiredGroups) {
      if (!existingGroupNames.includes(groupName)) {
        await cognitoClient.send(
          new CreateGroupCommand({
            UserPoolId: USER_POOL_ID,
            GroupName: groupName,
            Description: `${groupName === 'hosts' ? 'Host' : 'Super Admin'} users group`
          })
        );
        console.log(`Created group: ${groupName}`);
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error creating default Cognito groups:', error);
    return {
      success: false,
      error
    };
  }
}

/**
 * Authenticate a user (admin level auth)
 */
export async function authenticateUser(username: string, password: string) {
  try {
    const command = new AdminInitiateAuthCommand({
      UserPoolId: USER_POOL_ID,
      ClientId: USER_POOL_CLIENT_ID,
      AuthFlow: AuthFlowType.ADMIN_USER_PASSWORD_AUTH,
      AuthParameters: {
        USERNAME: username,
        PASSWORD: password
      }
    });
    
    const response = await cognitoClient.send(command);
    
    return {
      success: true,
      authResult: response.AuthenticationResult
    };
  } catch (error) {
    console.error('Error authenticating user:', error);
    return {
      success: false,
      error
    };
  }
}

/**
 * Get user details
 */
export async function getUserDetails(username: string) {
  try {
    const command = new AdminGetUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: username
    });
    
    const user = await cognitoClient.send(command);
    
    // Get user groups
    const groupsCommand = new AdminListGroupsForUserCommand({
      UserPoolId: USER_POOL_ID,
      Username: username
    });
    
    const groupsResponse = await cognitoClient.send(groupsCommand);
    const groups = (groupsResponse.Groups || []).map(g => g.GroupName);
    
    return {
      success: true,
      user,
      groups
    };
  } catch (error) {
    console.error('Error getting user details:', error);
    return {
      success: false,
      error
    };
  }
}

/**
 * Add custom attribute to the user pool
 */
export async function addCustomAttributes(attributes: SchemaAttributeType[]) {
  try {
    const command = new AddCustomAttributesCommand({
      UserPoolId: USER_POOL_ID,
      CustomAttributes: attributes
    });
    
    await cognitoClient.send(command);
    
    return { success: true };
  } catch (error) {
    console.error('Error adding custom attributes:', error);
    return {
      success: false,
      error
    };
  }
}

/**
 * Initialize Cognito with default groups and attributes
 */
export async function initializeCognito() {
  try {
    // Create default groups
    await createDefaultCognitoGroups();
    
    // Add custom attributes if needed
    await addCustomAttributes([
      {
        AttributeDataType: 'String',
        Name: 'hostName',
        Mutable: true
      },
      {
        AttributeDataType: 'String',
        Name: 'hostId',
        Mutable: true
      }
    ]);
    
    return { success: true };
  } catch (error) {
    console.error('Error initializing Cognito:', error);
    return {
      success: false,
      error
    };
  }
}