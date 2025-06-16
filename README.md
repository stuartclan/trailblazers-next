# Trailblazers Check-In System

A Next.js application for tracking athlete check-ins and rewards for the Trailblazers organization. This application allows athletes to check-in at various host locations, track their progress, and earn rewards for their participation.

## Features

- **Multi-Host Support**: Manage multiple hosts and locations within a single system
- **Check-In Tracking**: Track athlete check-ins across various activities and locations
- **Reward System**: Global rewards for all Trailblazers and host-specific custom rewards
- **Pet Check-Ins**: Allow athletes to check-in their pets alongside themselves
- **Disclaimer Management**: Host-specific disclaimers that athletes must accept
- **Super-Admin Dashboard**: Manage hosts, locations, activities, and global rewards
- **Host Admin Dashboard**: Manage location-specific settings and reward claims
- **Authentication**: AWS Cognito for secure user authentication
- **Serverless Architecture**: Built with SST and deployed to AWS

## Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, React Query
- **Styling**: SCSS with BEM methodology
- **Authentication**: AWS Cognito
- **Database**: AWS DynamoDB with single-table design
- **Deployment**: SST (Serverless Stack) and OpenNext
- **CI/CD**: GitHub Actions

## Project Structure

The project follows an atomic design pattern for components:

```
trailblazers-next/
├── app/                       # Next.js App Router pages
│   ├── api/                   # API routes
│   ├── host/                  # Host routes
│   ├── super-admin/           # Super-admin routes
│   ├── checkin/               # Check-in route
│   └── [...]                  # Other routes
├── components/                # React components
│   ├── atoms/                 # Basic building blocks
│   ├── molecules/             # Combinations of atoms
│   └── organisms/             # Complex UI sections
├── hooks/                     # Custom React hooks
├── lib/                       # Library code
│   ├── auth/                  # Authentication
│   ├── db/                    # Database access
│   └── utils/                 # Utilities
└── [...]                      # Other configuration files
```

## Getting Started

### Prerequisites

- Node.js 18 or later
- AWS account
- AWS CLI configured locally

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-organization/trailblazers-next.git
   cd trailblazers-next
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env.local` file in the root directory with the following variables:
   ```
   # AWS Configuration
   REGION=us-east-1
   
   # Cognito
   USER_POOL_ID=your-user-pool-id
   USER_POOL_CLIENT_ID=your-user-pool-client-id
   
   # DynamoDB
   TABLE_NAME=your-table-name
   
   # Next.js
   NEXTAUTH_SECRET=your-secret-here
   ```

4. Run the development server:
   ```bash
   npm run dev
   ```

### Deployment

Deploy to AWS using SST:

```bash
npm run deploy
```

## User Types and Workflows

### Super Admin
- Create and manage hosts
- Configure global rewards
- Manage activities
- Oversee all athletes and check-ins

### Host Admin
- Manage location activities
- Configure host-specific rewards
- Track athlete check-ins
- Process reward claims

### Athlete
- Check-in at host locations
- Track progress toward rewards
- Register pets for check-ins
- Sign host-specific disclaimers

## Data Model

The application uses a single-table design in DynamoDB for efficient querying and storage. Key entity types include:

- Hosts
- Locations
- Athletes
- Pets
- Activities
- Check-ins
- Rewards
- Reward Claims

## Create Super Admin

Create the super admin user in Cognito and assign the "super-admins" group. Once that is done, run the following awscli command to update the account and remove the FORCE_CHANGE_PASSWORD:
```bash
aws cognito-idp admin-set-user-password \
  --user-pool-id <your-user-pool-id> \
  --username <username> \
  --password <password> \
  --permanent
```

## License

This project is licensed under the MIT License - see the LICENSE file for details.