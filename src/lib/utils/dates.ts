import { format, formatDistanceToNow, isToday, isYesterday, parseISO } from 'date-fns';

/**
 * Format a date as a readable string
 */
export function formatDate(date: Date | number | string): string {
  // Convert string to Date if necessary
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  return format(dateObj, 'MMM d, yyyy');
}

/**
 * Format a time as a readable string
 */
export function formatTime(date: Date | number | string): string {
  // Convert string to Date if necessary
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  return format(dateObj, 'h:mm a');
}

/**
 * Format a date and time as a readable string
 */
export function formatDateTime(date: Date | number | string): string {
  // Convert string to Date if necessary
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  return format(dateObj, 'MMM d, yyyy h:mm a');
}

/**
 * Format a date as a relative time (e.g., "5 minutes ago", "2 days ago")
 */
export function formatRelativeTime(date: Date | number | string): string {
  // Convert string to Date if necessary
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  
  // Check if the date is today or yesterday
  if (isToday(dateObj)) {
    return `Today at ${format(dateObj, 'h:mm a')}`;
  } else if (isYesterday(dateObj)) {
    return `Yesterday at ${format(dateObj, 'h:mm a')}`;
  }
  
  // Otherwise, use relative time
  return formatDistanceToNow(dateObj, { addSuffix: true });
}

/**
 * Convert a Unix timestamp to a Date object
 */
export function unixToDate(timestamp: number): Date {
  // If the timestamp is in seconds (10 digits), convert to milliseconds
  if (timestamp < 10000000000) {
    return new Date(timestamp * 1000);
  }
  
  // Otherwise, assume it's already in milliseconds
  return new Date(timestamp);
}

/**
 * Convert a Date object to a Unix timestamp (seconds)
 */
export function dateToUnix(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

/**
 * Get the current date in ISO format (YYYY-MM-DD)
 */
export function getCurrentDateISO(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

/**
 * Get the start of the current week as a Date
 * (Weeks start on Sunday by default)
 */
export function getStartOfWeek(date: Date = new Date()): Date {
  const day = date.getDay(); // 0 (Sunday) to 6 (Saturday)
  const diff = date.getDate() - day;
  return new Date(date.setDate(diff));
}

/**
 * Get the start of the current week as a Unix timestamp
 */
export function getStartOfWeekUnix(): number {
  return dateToUnix(getStartOfWeek());
}

/**
 * Check if a date falls within the current week
 */
export function isDateInCurrentWeek(date: Date | number | string): boolean {
  // Convert string or timestamp to Date if necessary
  const dateObj = typeof date === 'string' 
    ? parseISO(date) 
    : (typeof date === 'number' ? unixToDate(date) : date);
  
  const startOfWeek = getStartOfWeek();
  const endOfWeek = new Date(startOfWeek);
  endOfWeek.setDate(startOfWeek.getDate() + 7);
  
  return dateObj >= startOfWeek && dateObj < endOfWeek;
}