'use client';

import * as React from 'react';

import { Badge } from '@/components/atoms/badge/badge';
import { Button } from '@/components/atoms/button/button';
import { Heading } from '@/components/atoms/heading/heading';
import { Icon } from '@/components/atoms/icon/icon';
import { RewardEntity } from '@/lib/db/entities/types';
import { cn } from '@/lib/utils/ui';

interface RewardItemProps {
  reward: RewardEntity;
  currentCount: number;
  isEligible: boolean;
  isClaimed: boolean;
  onClaim?: (rewardId: string) => void;
  isClaimLoading?: boolean;
  disabled?: boolean;
}

/**
 * Individual reward item component
 */
const RewardItem: React.FC<RewardItemProps> = ({
  reward,
  currentCount,
  isEligible,
  isClaimed,
  onClaim,
  isClaimLoading,
  disabled,
}) => {
  // Calculate progress percentage
  const progressPercentage = Math.min(Math.round((currentCount / reward.cnt) * 100), 100);
  
  // Handle claim button click
  const handleClaim = () => {
    if (onClaim && isEligible && !isClaimed) {
      onClaim(reward.id);
    }
  };
  
  return (
    <div className={cn(
      'reward-item border-1 rounded-lg p-4 bg-white',
      isClaimed && 'bg-gray-50'
    )}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <div className={cn(
            'h-10 w-10 rounded-full flex items-center justify-center mr-3',
            isEligible ? 'bg-primary-light text-primary' : 'bg-gray-100 text-gray-500'
          )}>
            <Icon name={reward.i} size="md" />
          </div>
          <div>
            <h3 className="font-medium">{reward.n}</h3>
            <p className="text-sm text-gray-500">{reward.cnt} check-ins required</p>
          </div>
        </div>
        
        {isClaimed ? (
          <Badge variant="success">Claimed</Badge>
        ) : isEligible ? (
          <Badge variant="success">Eligible</Badge>
        ) : (
          <Badge variant="outline">{reward.cnt - currentCount} more to go</Badge>
        )}
      </div>
      
      {/* Progress bar */}
      <div className="h-2 w-full bg-gray-100 rounded-full mb-3">
        <div
          className={cn(
            'h-full rounded-full',
            isEligible || isClaimed ? 'bg-primary' : 'bg-gray-300'
          )}
          style={{ width: `${progressPercentage}%` }}
        ></div>
      </div>
      
      <div className="flex justify-between items-center">
        <span className="text-sm text-gray-500">
          {currentCount} / {reward.cnt} check-ins
        </span>
        
        {!isClaimed && onClaim && (
          <Button
            variant={isEligible ? 'default' : 'outline'}
            size="sm"
            onClick={handleClaim}
            disabled={!isEligible || disabled || isClaimLoading}
          >
            {isClaimLoading ? 'Claiming...' : 'Claim Reward'}
          </Button>
        )}
      </div>
    </div>
  );
};

interface RewardsDisplayProps {
  rewards: RewardEntity[];
  currentCounts: Record<string, number>;
  claimedRewardIds?: string[];
  onClaimReward?: (rewardId: string) => void;
  isClaimLoading?: boolean;
  title?: string;
  emptyMessage?: string;
  rewardType?: 'global' | 'host' | 'pet' | 'all';
  showHeader?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * A specialized component for displaying rewards and their progress
 */
export const RewardsDisplay: React.FC<RewardsDisplayProps> = ({
  rewards,
  currentCounts,
  claimedRewardIds = [],
  onClaimReward,
  isClaimLoading = false,
  title = 'Rewards',
  emptyMessage = 'No rewards available',
  rewardType,
  showHeader = true,
  disabled = false,
  className,
}) => {
  // Filter rewards by type if specified
  const filteredRewards = rewardType && rewardType !== 'all'
    ? rewards.filter(reward => reward.rt === rewardType)
    : rewards;
  
  // Sort rewards: claimed first, then eligible, then by count required (ascending)
  const sortedRewards = [...filteredRewards].sort((a, b) => {
    const aIsClaimed = claimedRewardIds.includes(a.id);
    const bIsClaimed = claimedRewardIds.includes(b.id);
    
    if (aIsClaimed && !bIsClaimed) return -1;
    if (!aIsClaimed && bIsClaimed) return 1;
    
    const aIsEligible = (currentCounts[a.id] || 0) >= a.cnt;
    const bIsEligible = (currentCounts[b.id] || 0) >= b.cnt;
    
    if (aIsEligible && !bIsEligible) return -1;
    if (!aIsEligible && bIsEligible) return 1;
    
    return a.cnt - b.cnt;
  });
  
  if (sortedRewards.length === 0) {
    return (
      <div className={cn('rewards-display', className)}>
        {showHeader && <Heading level="h3" className="mb-4">{title}</Heading>}
        <div className="text-center py-6 text-gray-500">{emptyMessage}</div>
      </div>
    );
  }
  
  return (
    <div className={cn('rewards-display', className)}>
      {showHeader && <Heading level="h3" className="mb-4">{title}</Heading>}
      
      <div className="space-y-4">
        {sortedRewards.map((reward) => (
          <RewardItem
            key={reward.id}
            reward={reward}
            currentCount={currentCounts[reward.id] || 0}
            isEligible={(currentCounts[reward.id] || 0) >= reward.cnt}
            isClaimed={claimedRewardIds.includes(reward.id)}
            onClaim={onClaimReward}
            isClaimLoading={isClaimLoading}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
};