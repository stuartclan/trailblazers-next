# Trailblazers API Structure

## Authentication APIs

All API routes are protected with AWS Cognito authentication. The token must be included in the Authorization header as a Bearer token.

## Hosts APIs

- `GET /api/hosts`: List all hosts (super-admin only)
- `POST /api/hosts`: Create a new host (super-admin only)
- `GET /api/hosts/:hostId`: Get a specific host
- `PATCH /api/hosts/:hostId`: Update a host
- `DELETE /api/hosts/:hostId`: Delete a host (super-admin only)
- `GET /api/hosts/:hostId/locations`: Get locations for a host
- `GET /api/hosts/:hostId/checkins`: Get check-ins for a host
- `GET /api/hosts/:hostId/pet-checkins`: Get pet check-ins for a host
- `GET /api/hosts/:hostId/rewards`: Get rewards for a host
- `POST /api/hosts/:hostId/rewards`: Create a new reward for a host
- `GET /api/hosts/:hostId/rewards/claims`: Get reward claims for a host
- `POST /api/hosts/:hostId/locations`: Create a new location (super-admin only)
- `GET /api/hosts/:hostId/locations/:locationId`: Get a specific location
- `PATCH /api/hosts/:hostId/locations/:locationId`: Update a location (super-admin only)
- `DELETE /api/hosts/:hostId/locations/:locationId`: Delete a location (super-admin only)
- `GET /api/hosts/:hostId/locations/:locationId/activities`: Get activities for a location
- `PUT /api/hosts/:hostId/locations/:locationId/activities`: Update activities for a location

## Locations APIs

- `GET /api/locations`: List all locations (super-admin only)

## Activities APIs

- `GET /api/activities`: List all activities
- `POST /api/activities`: Create a new activity (super-admin only)
- `GET /api/activities/:activityId`: Get a specific activity
- `PATCH /api/activities/:activityId`: Update an activity (super-admin only)
- `DELETE /api/activities/:activityId`: Delete an activity (super-admin only)
- `POST /api/activities/create-defaults`: Create default activities (super-admin only)

## Athletes APIs

- `GET /api/athletes`: List all athletes (paginated)
- `POST /api/athletes`: Create a new athlete
- `GET /api/athletes/search`: Search for athletes by name
- `GET /api/athletes/:athleteId`: Get a specific athlete
- `PATCH /api/athletes/:athleteId`: Update an athlete
- `DELETE /api/athletes/:athleteId`: Delete an athlete (soft delete, super-admin only)
- `GET /api/athletes/:athleteId/checkins`: Get check-ins for an athlete
- `GET /api/athletes/:athleteId/checkins/count`: Get check-in count for an athlete
- `GET /api/athletes/:athleteId/checkins/recent`: Check if athlete has checked in recently at a host
- `GET /api/athletes/:athleteId/pets`: Get pets for an athlete
- `GET /api/athletes/:athleteId/pets/exists`: Check if a pet with a specific name exists for an athlete
- `GET /api/athletes/:athleteId/rewards/claims`: Get reward claims for an athlete
- `GET /api/athletes/:athleteId/rewards/eligibility`: Get reward eligibility for an athlete
- `POST /api/athletes/:athleteId/disclaimer`: Sign a disclaimer for an athlete
- `GET /api/athletes/:athleteId/disclaimer/:hostId`: Check if athlete has signed a disclaimer for a host

## Pets APIs

- `GET /api/pets`: List all pets (super-admin only)
- `POST /api/pets`: Create a new pet
- `GET /api/pets/:petId`: Get a specific pet
- `PATCH /api/pets/:petId`: Update a pet
- `DELETE /api/pets/:petId`: Delete a pet
- `GET /api/pets/:petId/checkins`: Get check-ins for a pet
- `GET /api/pets/:petId/checkins/count`: Get check-in count for a pet
- `GET /api/pets/:petId/rewards/eligibility`: Get reward eligibility for a pet

## Check-ins APIs

- `POST /api/checkins`: Create a new check-in
- `POST /api/pet-checkins`: Create a new pet check-in

## Rewards APIs

- `GET /api/rewards/global`: Get global rewards
- `GET /api/rewards/pet`: Get pet rewards
- `POST /api/rewards`: Create a new reward (super-admin only)
- `GET /api/rewards/:rewardId`: Get a specific reward
- `PATCH /api/rewards/:rewardId`: Update a reward
- `DELETE /api/rewards/:rewardId`: Delete a reward
- `POST /api/rewards/claims`: Create a new reward claim
- `POST /api/rewards/create-defaults`: Create default rewards (super-admin only)

## Notes

1. All routes are protected by authentication.
2. Some routes have additional authorization checks for super-admin or host privileges.
3. Most routes follow REST principles for CRUD operations.
4. Query parameters are used for filtering and pagination where appropriate.
