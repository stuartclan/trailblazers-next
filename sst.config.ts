// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "trailblazers",
      removal: input?.stage === "production" ? "retain" : "remove",
      home: "aws",
      providers: {
        aws: {
          region: "us-east-2",
        },
        random: "4.18.2",
      },
    };
  },
  async run() {
    const isProd = $app.stage === 'prod';

    // DynamoDB Table for single-table design
    const table = new sst.aws.Dynamo("Trailblazers", {
      fields: {
        pk: "string",
        sk: "string",
        GSI1PK: "string",
        GSI1SK: "string",
        GSI2PK: "string",
        GSI2SK: "string",
        GSI3PK: "string",
        GSI3SK: "string",
      },
      primaryIndex: { hashKey: "pk", rangeKey: "sk" },
      globalIndexes: {
        GSI1: { hashKey: "GSI1PK", rangeKey: "GSI1SK" },
        GSI2: { hashKey: "GSI2PK", rangeKey: "GSI2SK" },
        GSI3: { hashKey: "GSI3PK", rangeKey: "GSI3SK" },
      },
    });

    // Cognito User Pool for authentication
    const userPool = new sst.aws.CognitoUserPool("TrailblazersUsers", {
      usernames: ["email"],
      transform: {
        userPool: {
          deletionProtection: 'ACTIVE',
          // ADD CUSTOM ATTRIBUTES SCHEMA
          schemas: [
            {
              attributeDataType: 'String',
              name: 'hostName',
              mutable: true,
              required: false,
            },
            {
              attributeDataType: 'String',
              name: 'hostId',
              mutable: true,
              required: false,
            }
          ],
          // TODO: Configure custom email via SES?
          // emailConfiguration: {
          //   fromEmailAddress: 'info@clubtrailblazers.com',
          //   emailSendingAccount: 'DEVELOPER',
          // },
          // Password policy
          passwordPolicy: {
            minimumLength: 8,
            requireLowercase: true,
            requireNumbers: true,
            requireSymbols: true,
            requireUppercase: true,
          },

          // Account recovery settings
          accountRecoverySetting: {
            recoveryMechanisms: [
              {
                name: 'verified_email',
                priority: 1,
              },
            ],
            // email: true,
            // phone: false,
          },

          // Email configuration
          // emailConfiguration: {
          //   fromEmailAddress: 'noreply@clubtrailblazers.com',
          // },
          emailVerificationSubject: 'Your Trailblazers verification code',
          // email: {
          //   from: "noreply@trailblazers.app", // Change to your domain
          //   subject: "Your Trailblazers verification code",
          // },
          autoVerifiedAttributes: ['email'],
        }
      },

      // // User pool policies
      // policies: {
      //   selfSignup: true,
      //   verification: {
      //     email: true,
      //   },
      // },
    });

    const userPoolClient = userPool.addClient("TrailblazersApp", {
      transform: {
        client: {
          // "ADMIN_NO_SRP_AUTH" "CUSTOM_AUTH_FLOW_ONLY" "USER_PASSWORD_AUTH" "ALLOW_ADMIN_USER_PASSWORD_AUTH" "ALLOW_CUSTOM_AUTH" "ALLOW_USER_PASSWORD_AUTH" "ALLOW_USER_SRP_AUTH" "ALLOW_REFRESH_TOKEN_AUTH" "ALLOW_USER_AUTH"
          explicitAuthFlows: [
            "ADMIN_NO_SRP_AUTH",
            // "ALLOW_USER_SRP_AUTH", 
            "USER_PASSWORD_AUTH",
            // "ALLOW_REFRESH_TOKEN_AUTH",
          ],
          generateSecret: false, // Set to true for server-side apps

          // Token validity
          accessTokenValidity: 1, // 1 hour
          idTokenValidity: 1, // 1 hour  
          refreshTokenValidity: 30, // 30 days
        },
      },
    });

    // // Cognito User Pool Client
    // const userPoolClient = new sst.aws.CognitoUserPoolClient("TrailblazersUserPoolClient", {
    //   userPoolId: userPool.id,
    //   authFlows: [
    //     "ADMIN_NO_SRP_AUTH",
    //     "USER_SRP_AUTH", 
    //     "USER_PASSWORD_AUTH",
    //     "ALLOW_REFRESH_TOKEN_AUTH",
    //   ],
    //   generateSecret: false, // Set to true for server-side apps

    //   // // OAuth settings (optional - for social login)
    //   // oauth: {
    //   //   flows: ["code"],
    //   //   scopes: ["email", "openid", "profile"],
    //   //   callbackUrls: [
    //   //     $dev ? "http://localhost:3000/api/auth/callback/cognito" : "https://trailblazers.app/api/auth/callback/cognito"
    //   //   ],
    //   //   logoutUrls: [
    //   //     $dev ? "http://localhost:3000" : "https://trailblazers.app"
    //   //   ],
    //   // },

    //   // Token validity
    //   accessTokenValidity: 60, // 1 hour
    //   idTokenValidity: 60, // 1 hour  
    //   refreshTokenValidity: 43200, // 30 days
    // });

    // // Don't think and Identity Pool is needed
    // // Cognito Identity Pool for AWS credentials
    // const identityPool = new sst.aws.CognitoIdentityPool("TrailblazersIdentityPool", {
    //   userPools: [
    //     {
    //       userPool: userPool.id,
    //       client: userPoolClient.id,
    //     },
    //   ],
    //   permissions: {
    //     authenticated: [
    //       {
    //         actions: [
    //           "dynamodb:GetItem",
    //           "dynamodb:PutItem", 
    //           "dynamodb:UpdateItem",
    //           "dynamodb:DeleteItem",
    //           "dynamodb:Query",
    //           "dynamodb:Scan",
    //         ],
    //         resources: [table.arn, `${table.arn}/index/*`],
    //       },
    //     ],
    //     unauthenticated: [
    //       {
    //         actions: [
    //           "dynamodb:GetItem",
    //           "dynamodb:Query",
    //         ],
    //         resources: [table.arn, `${table.arn}/index/*`],
    //         // conditions: {
    //         //   "ForAllValues:StringEquals": {
    //         //     "dynamodb:LeadingKeys": ["PUBLIC#"],
    //         //   },
    //         // },
    //       },
    //     ],
    //   },
    // });

    // // API Gateway for backend endpoints (optional - if you need REST API)
    // const api = new sst.aws.ApiGatewayV2("TrailblazersApi", {
    //   cors: {
    //     allowCredentials: true,
    //     allowHeaders: ["content-type", "authorization"],
    //     allowMethods: ["*"],
    //     allowOrigins: $dev ? ["http://localhost:3000"] : ["https://trailblazers.app"],
    //   },
    // });

    // // Lambda function for API endpoints (if needed beyond Next.js API routes)
    // const lambda = new sst.aws.Function("TrailblazersApiFunction", {
    //   handler: "src/lambda/api.handler",
    //   runtime: "nodejs20.x",
    //   environment: {
    //     TABLE_NAME: table.name,
    //     USER_POOL_ID: userPool.id,
    //     USER_POOL_CLIENT_ID: userPoolClient.id,
    //     IDENTITY_POOL_ID: identityPool.id,
    //   },
    //   permissions: [
    //     {
    //       actions: [
    //         "dynamodb:GetItem",
    //         "dynamodb:PutItem",
    //         "dynamodb:UpdateItem", 
    //         "dynamodb:DeleteItem",
    //         "dynamodb:Query",
    //         "dynamodb:Scan",
    //       ],
    //       resources: [table.arn, `${table.arn}/index/*`],
    //     },
    //     {
    //       actions: [
    //         "cognito-idp:AdminCreateUser",
    //         "cognito-idp:AdminSetUserPassword",
    //         "cognito-idp:AdminUpdateUserAttributes",
    //         "cognito-idp:ListUsers",
    //       ],
    //       resources: [userPool.arn],
    //     },
    //   ],
    // });

    // // Connect API routes (if using API Gateway)
    // api.route("GET /health", lambda.arn);
    // api.route("POST /api/{proxy+}", lambda.arn);
    // api.route("GET /api/{proxy+}", lambda.arn);
    // api.route("PUT /api/{proxy+}", lambda.arn);
    // api.route("DELETE /api/{proxy+}", lambda.arn);

    // // S3 bucket for file uploads (optional)
    // const bucket = new sst.aws.Bucket("TrailblazersBucket", {
    //   access: "public-read",
    //   cors: [
    //     {
    //       allowedHeaders: ["*"],
    //       allowedMethods: ["GET", "POST", "PUT", "DELETE"],
    //       allowedOrigins: ["*"],
    //       maxAge: 3000,
    //     },
    //   ],
    // });

    // Next.js application using OpenNext
    const nextjs = new sst.aws.Nextjs("TrailblazersWeb", {
      environment: {
        // AWS Configuration
        AWS_REGION_NAME: aws.getRegionOutput().name, // Reserved and already provided

        // DynamoDB
        DYNAMODB_TABLE_NAME: table.name,

        // Cognito Configuration
        COGNITO_USER_POOL_ID: userPool.id,
        COGNITO_USER_POOL_CLIENT_ID: userPoolClient.id,
        // COGNITO_IDENTITY_POOL_ID: identityPool.id,

        // NextAuth Configuration
        NEXTAUTH_URL: $dev ? "http://localhost:3000" : "https://clubtrailblazers.com",
        NEXTAUTH_SECRET: new random.RandomPassword("NextAuthSecret", {
          length: 32,
          special: false,
        }).result,

        // // API Configuration
        // API_URL: api.url,

        // // S3 Configuration
        // S3_BUCKET_NAME: bucket.name,
        // S3_BUCKET_URL: bucket.domain,

        // Application Configuration
        APP_NAME: "Trailblazers Check-In System",
        APP_VERSION: "1.0.0",
        NODE_ENV: $dev ? "development" : "production",
        NEXT_PUBLIC_POOL_ID: userPool.id,
        NEXT_PUBLIC_POOL_CLIENT_ID: userPoolClient.id,
      },

      // Domain configuration (optional)
      domain: $dev ? undefined : {
        name: `checkin${!isProd ? `.${$app.stage}` : ''}.clubtrailblazers.com`,
        dns: false,
        cert: process.env.AWS_CERT_ARN,
      },

      // OpenNext configuration
      openNextVersion: "3.0.0",
      buildCommand: "pnpm run build",
      dev: {
        command: 'pnpm run dev:next',
      },

      // Performance optimizations
      server: {
        memory: "1024 MB",
        timeout: "30 seconds",
      },
      transform: {
        server: {
          logging: {
            format: 'json',
            retention: '1 month',
          }
        }
      }

      // // Edge configuration for global performance
      // edge: false, // Set to true for edge deployment
    });

    // // CloudWatch Log Groups for monitoring
    // const logGroup = new aws.cloudwatch.LogGroup("TrailblazersLogs", {
    //   name: "/aws/lambda/trailblazers",
    //   retentionInDays: 14,
    // });

    // // CloudWatch Dashboard for monitoring (optional)
    // const dashboard = new aws.cloudwatch.Dashboard("TrailblazersDashboard", {
    //   dashboardName: "trailblazers-monitoring",
    //   dashboardBody: JSON.stringify({
    //     widgets: [
    //       {
    //         type: "metric",
    //         properties: {
    //           metrics: [
    //             ["AWS/Lambda", "Duration", "FunctionName", "TrailblazersApiFunction"],
    //             ["AWS/Lambda", "Errors", "FunctionName", "TrailblazersApiFunction"],
    //             ["AWS/Lambda", "Invocations", "FunctionName", "TrailblazersApiFunction"],
    //           ],
    //           period: 300,
    //           stat: "Average",
    //           region: "us-east-1",
    //           title: "Lambda Metrics",
    //         },
    //       },
    //       {
    //         type: "metric", 
    //         properties: {
    //           metrics: [
    //             ["AWS/DynamoDB", "ConsumedReadCapacityUnits", "TableName", table.name],
    //             ["AWS/DynamoDB", "ConsumedWriteCapacityUnits", "TableName", table.name],
    //           ],
    //           period: 300,
    //           stat: "Sum",
    //           region: "us-east-1", 
    //           title: "DynamoDB Metrics",
    //         },
    //       },
    //     ],
    //   }),
    // });

    // Outputs for environment configuration
    return {
      // Application URLs
      url: nextjs.url,
      // apiUrl: api.url,

      // AWS Resources
      tableName: table.name,
      tableArn: table.arn,

      // Cognito Configuration
      userPoolId: userPool.id,
      userPoolClientId: userPoolClient.id,
      // identityPoolId: identityPool.id,

      // // S3 Configuration
      // bucketName: bucket.name,
      // bucketUrl: bucket.domain,

      // // Monitoring
      // dashboardUrl: `https://console.aws.amazon.com/cloudwatch/home?region=us-east-1#dashboards:name=${dashboard.dashboardName}`,
    };
  },
});
