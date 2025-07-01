export interface BaseEntity {
  pk: string;
  sk: string;
  t: string;
  id: string;
  c: number; // created timestamp
  u: number; // updated timestamp
}

export interface HostEntity extends BaseEntity {
  t: 'host';
  n: string; // name
  e: string; // email
  cid: string; // Cognito ID
  p: string; // admin password
  lids: string[]; // location IDs
  disc?: string; // disclaimer text
  cr?: HostReward[]; // custom rewards
  GSI1PK: string; // 'TYPE#host'
  GSI1SK: string; // 'HOST#[hostId]'
}

export interface ErrorCognito {
  error: string;
  details?: {
    name?: string;
    // other props as necessary
  }
  // {
  //   "error": "Failed to create Cognito user",
  //   "details": {
  //       "name": "UsernameExistsException",
  //       "$fault": "client",
  //       "$metadata": {
  //           "httpStatusCode": 400,
  //           "requestId": "b65204f4-0454-4103-b8de-01a3bc3a8113",
  //           "attempts": 1,
  //           "totalRetryDelay": 0
  //       },
  //       "__type": "UsernameExistsException"
  //   }
  // }
}

export interface HostReward {
  id: string;
  c: number; // check-in count
  n: string; // name
  i: string; // icon
}

export interface LocationEntity extends BaseEntity {
  t: 'location';
  hid: string; // host ID
  n: string; // name
  a: string; // address
  acts: string[]; // activity IDs
  GSI1PK: string; // HOST#[hostId]
  GSI1SK: string; // LOC#[locationId]
  GSI2PK: string; // TYPE#location
  GSI2SK: string; // LOC#[locationId]
}

export interface ActivityEntity extends BaseEntity {
  t: 'activity';
  n: string; // name
  i: string; // icon (Material UI name)
  en: boolean; // enabled globally
  GSI1PK: string; // 'TYPE#activity'
  GSI1SK: string; // 'ACT#[activityId]'
}

// Athlete entity
export interface AthleteEntity extends BaseEntity {
  t: 'athlete';
  fn: string; // first name
  ln: string; // last name
  mi?: string; // middle initial
  e: string; // email
  em?: string; // employer
  sg?: string; // shirt gender
  ss?: string; // shirt size
  lw: Record<string, string>; // last weekly check-in per host: hostId -> "timestamp#activityId"
  gc: number; // global check-in count (for global rewards)
  lc?: number; // legacy check-in count (reference only)
  en?: string; // emergency name
  ep?: string; // emergency phone
  ar?: boolean; // archived reward
  ds: Record<string, number>; // disclaimer signatures: hostId -> unix timestamp
  del: boolean; // soft delete flag

  GSI1PK: string; // 'TYPE#athlete' 
  GSI1SK: string; // 'EMAIL#[email]'
  GSI2PK: string; // 'TYPE#athlete'
  GSI2SK: string; // NAME#[LASTNAME]#[FIRSTNAME]
}

export interface PetEntity extends BaseEntity {
  t: 'pet';
  aid: string; // athlete ID (owner)
  n: string; // pet name
  GSI1PK: string; // ATH#[athleteId]
  GSI1SK: string; // PET#[petId]
  GSI2PK: string; // TYPE#pet
  GSI2SK: string; // PET#${petId}
}

export interface CheckInEntity extends BaseEntity {
  t: 'checkin';
  aid: string; // athlete ID
  hid: string; // host ID
  lid: string; // location ID
  actid: string; // activity ID
  GSI1PK: string; // HOST#[hostId]
  GSI1SK: string; // CI#[timestamp]
  GSI3PK: string; // DATE#[YYYY-MM-DD]
  GSI3SK: string; // CI#[athleteId]
}

export interface PetCheckInEntity extends BaseEntity {
  t: 'pet-checkin';
  aid: string; // athlete ID
  pid: string; // pet ID
  hid: string; // host ID
  lid: string; // location ID
  GSI1PK: string; // HOST#[hostId]
  GSI1SK: string; // PCI#[timestamp]
}

export interface RewardEntity extends BaseEntity {
  t: 'reward';
  cnt: number; // check-in count required
  n: string; // name
  i: string; // icon
  rt: 'global' | 'host' | 'pet'; // reward type
  hid?: string; // host ID (for host-specific rewards)
  GSI1PK?: string; // HOST#[hostId] (for host-specific rewards)
  GSI1SK?: string; // REW#[rewardId]
}

export interface RewardClaimEntity extends BaseEntity {
  t: 'reward-claim';
  aid: string; // athlete ID
  rid: string; // reward ID
  hid: string; // host ID where claimed
  lid: string; // location ID where claimed
  pid?: string; // pet ID (for pet rewards)
  GSI1PK: string; // HOST#[hostId]
  GSI1SK: string; // RC#[timestamp]
}
