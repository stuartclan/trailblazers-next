import { Icon, IconNames, IconProps } from "@/components/atoms/icon/icon";

import { ActivityEntity } from "@/lib/db/entities/types";
import { cn } from "@/lib/utils/ui";

interface ActivityIconCircleProps {
    activity: Partial<ActivityEntity>;
    size?: 'sm' | 'md' | 'lg';
    variant?: 'default' | 'ghost';
    busy?: boolean;
}

const sizeMapper: Record<string, { size: string, iconSize: IconProps['size'] }> = {
    // sm: { size: 'w-8 h-8', iconSize: 'lg' },
    // md: { size: 'w-12 h-12', iconSize: 'xl' },
    // lg: { size: 'w-16 h-16', iconSize: 'xxl' },
    sm: { size: 'p-1.5', iconSize: 'lg' },
    md: { size: 'p-2', iconSize: 'xl' },
    lg: { size: 'p-2.5', iconSize: 'xxl' },
}

const styles = {
    'default': 'bg-primary text-white',
    'ghost': 'bg-gray-200 text-gray-500',
}

export const ActivityIconCircle = ({ activity, size = 'md', variant = 'default', busy = false }: ActivityIconCircleProps) => {
    const { size: wrapperSize, iconSize } = sizeMapper[size];

    return (
        <span className={cn('rounded-full flex items-center justify-center',
            activity.en ? styles[variant] : styles['ghost'],
            wrapperSize,
        )}>
            {!busy && <Icon name={activity.i || ''} variant="activity" size={iconSize} />}
            {busy && <Icon name={IconNames.Busy} variant="icon" className="animate-spin" size={iconSize} />}
        </span>
    )
}
