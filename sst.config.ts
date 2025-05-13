// eslint-disable-next-line @typescript-eslint/triple-slash-reference
/// <reference path="./.sst/platform/config.d.ts" />

export default $config({
  app(input) {
    return {
      name: "trailblazers-next",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
    };
  },
  async run() {
    new sst.aws.Nextjs("MyWeb");
  },
});

/*
import { SSTConfig } from "sst";
import { NextjsSite, Config, Table, Bucket, Auth } from "sst/constructs";

export default {
  config(_input) {
    return {
      name: "trailblazers-next",
      region: "us-east-2",
    };
  },
  stacks(app) {
    app.stack(({ stack }) => {
      // Create DynamoDB table with single-table design
      const table = new Table(stack, "trailblazers-table", {
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
        primaryIndex: {
          partitionKey: "pk",
          sortKey: "sk",
        },
        globalIndexes: {
          GSI1: {
            partitionKey: "GSI1PK",
            sortKey: "GSI1SK",
          },
          GSI2: {
            partitionKey: "GSI2PK",
            sortKey: "GSI2SK",
          },
          GSI3: {
            partitionKey: "GSI3PK",
            sortKey: "GSI3SK",
          },
        },
      });

      // Create Auth for Cognito
      const auth = new Auth(stack, "auth", {
        login: ["email"],
        cdk: {
          userPoolClient: {
            authFlows: {
              userPassword: true,
            },
          },
        },
      });

      // Create an upload bucket
      const bucket = new Bucket(stack, "uploads");

      // Define environment variables for the site
      const SITE_ENV = {
        REGION: stack.region,
        TABLE_NAME: table.tableName,
        BUCKET_NAME: bucket.bucketName,
        USER_POOL_ID: auth.userPoolId,
        USER_POOL_CLIENT_ID: auth.userPoolClientId,
        IDENTITY_POOL_ID: auth.cognitoIdentityPoolId || "",
      };

      // Create config for client-side access to environment variables
      const site_config = new Config.Parameter(stack, "SITE_CONFIG", {
        value: JSON.stringify({
          region: stack.region,
          userPoolId: auth.userPoolId,
          userPoolClientId: auth.userPoolClientId,
          identityPoolId: auth.cognitoIdentityPoolId || "",
        }),
      });

      // Create the NextjsSite
      const site = new NextjsSite(stack, "web", {
        path: ".",
        environment: {
          ...SITE_ENV,
          SITE_CONFIG: site_config.value,
        },
        bind: [table, bucket, auth],
        // OpenNext runtime
        runtime: "nodejs18.x",
        nodejs: {
          esbuild: {
            external: ["aws-sdk", "@aws-sdk/*"],
          },
        },
        // For production you can add a custom domain
        ...(app.stage === "prod" 
          ? {
              customDomain: {
                domainName: "trailblazers.example.com", // Replace with your domain
                domainAlias: "www.trailblazers.example.com", // Optional alias
              },
            }
          : {}),
      });

      // Output values
      stack.addOutputs({
        SiteUrl: site.url,
        UserPoolId: auth.userPoolId,
        UserPoolClientId: auth.userPoolClientId,
        IdentityPoolId: auth.cognitoIdentityPoolId || "No Identity Pool created",
        TableName: table.tableName,
        BucketName: bucket.bucketName,
      });
    });
  },
} satisfies SSTConfig;
*/