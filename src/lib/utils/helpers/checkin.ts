import { AthleteEntity } from "@/lib/db/entities/types";
import { isWithinCurrentWeek } from "../dates";

// Helper functions for the new lw property
export class CheckInHelper {
    /**
     * Parse the composite lw value to get timestamp and activity ID
     */
    static parseLwValue(lwValue: string): { timestamp: number; activityId: string } | null {
        if (!lwValue || !lwValue.includes('#')) return null;

        const [timestampStr, activityId] = lwValue.split('#');
        const timestamp = parseInt(timestampStr);

        if (isNaN(timestamp) || !activityId) return null;

        return { timestamp, activityId };
    }

    /**
     * Check if athlete can check in at a specific host this week
     */
    static canCheckInAtHost(athlete: AthleteEntity, hostId: string): boolean {
        const lwValue = athlete.lw?.[hostId];
        if (!lwValue) return true; // Never checked in at this host

        const parsed = this.parseLwValue(lwValue);
        if (!parsed) return true; // Invalid data, allow check-in

        return !isWithinCurrentWeek(parsed.timestamp);
    }

    /**
     * Check if athlete should get global count increment
     * (first check-in of the week across all hosts)
     */
    static shouldIncrementGlobalCount(athlete: AthleteEntity): boolean {
        // Check if any host has a check-in this week
        const hasCheckedInThisWeek = Object.values(athlete.lw || {}).some((lwValue: string) => {
            const parsed = this.parseLwValue(lwValue);
            return parsed && isWithinCurrentWeek(parsed.timestamp);
        });

        return !hasCheckedInThisWeek;
    }
}
