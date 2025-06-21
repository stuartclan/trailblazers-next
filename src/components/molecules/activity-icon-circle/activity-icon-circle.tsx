import { Icon, IconProps } from "@/components/atoms/icon/icon";

import { ActivityEntity } from "@/lib/db/entities/types";
import { cn } from "@/lib/utils/ui";

interface ActivityIconCircleProps {
    activity: Partial<ActivityEntity>;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default';
}

const sizeMapper: Record<string, { size: string, iconSize: IconProps['size'] }> = {
    sm: { size: 'w-8 h-8', iconSize: 'lg' },
    md: { size: 'w-12 h-12', iconSize: 'xl' },
    lg: { size: 'w-16 h-16', iconSize: 'xxl' },
}

export const ActivityIconCircle = ({ activity, size = 'md' }: ActivityIconCircleProps) => {
    const { size: wrapperSize, iconSize } = sizeMapper[size];
    return (
        <div className={cn('rounded-full flex items-center justify-center',
            activity.en ? 'bg-primary-light text-white' : 'bg-gray-200 text-gray-500',
            wrapperSize,
        )}>
            <Icon name={activity.i} size={iconSize} />
        </div>
    )
}
