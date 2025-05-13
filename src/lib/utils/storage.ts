/**
 * Utility functions for working with browser storage (localStorage and sessionStorage)
 */

// Constants for storage keys
const STORAGE_KEYS = {
  HOST_ID: 'currentHostId',
  LOCATION_ID: 'currentLocationId',
  ADMIN_AUTH_PREFIX: 'host_admin_auth_',
};

// Types
type StorageType = 'local' | 'session';

/**
 * Get a value from storage
 */
export function getStorageValue(key: string, storageType: StorageType = 'local'): string | null {
  if (typeof window === 'undefined') return null;
  
  const storage = storageType === 'local' ? localStorage : sessionStorage;
  return storage.getItem(key);
}

/**
 * Set a value in storage
 */
export function setStorageValue(key: string, value: string, storageType: StorageType = 'local'): void {
  if (typeof window === 'undefined') return;
  
  const storage = storageType === 'local' ? localStorage : sessionStorage;
  storage.setItem(key, value);
}

/**
 * Remove a value from storage
 */
export function removeStorageValue(key: string, storageType: StorageType = 'local'): void {
  if (typeof window === 'undefined') return;
  
  const storage = storageType === 'local' ? localStorage : sessionStorage;
  storage.removeItem(key);
}

/**
 * Check if a value exists in storage
 */
export function hasStorageValue(key: string, storageType: StorageType = 'local'): boolean {
  if (typeof window === 'undefined') return false;
  
  const storage = storageType === 'local' ? localStorage : sessionStorage;
  return storage.getItem(key) !== null;
}

/**
 * Clear all values from storage
 */
export function clearStorage(storageType: StorageType = 'local'): void {
  if (typeof window === 'undefined') return;
  
  const storage = storageType === 'local' ? localStorage : sessionStorage;
  storage.clear();
}

// Current host/location utilities

/**
 * Get current host ID
 */
export function getCurrentHostId(): string | null {
  return getStorageValue(STORAGE_KEYS.HOST_ID);
}

/**
 * Set current host ID
 */
export function setCurrentHostId(hostId: string): void {
  setStorageValue(STORAGE_KEYS.HOST_ID, hostId);
}

/**
 * Get current location ID
 */
export function getCurrentLocationId(): string | null {
  return getStorageValue(STORAGE_KEYS.LOCATION_ID);
}

/**
 * Set current location ID
 */
export function setCurrentLocationId(locationId: string): void {
  setStorageValue(STORAGE_KEYS.LOCATION_ID, locationId);
}

/**
 * Set both host and location IDs at once
 */
export function setCurrentHostAndLocation(hostId: string, locationId: string): void {
  setCurrentHostId(hostId);
  setCurrentLocationId(locationId);
}

/**
 * Clear current host and location
 */
export function clearCurrentHostAndLocation(): void {
  removeStorageValue(STORAGE_KEYS.HOST_ID);
  removeStorageValue(STORAGE_KEYS.LOCATION_ID);
}

// Host admin authentication utilities

/**
 * Set admin authentication for a host
 */
export function setHostAdminAuth(hostId: string): void {
  setStorageValue(`${STORAGE_KEYS.ADMIN_AUTH_PREFIX}${hostId}`, 'true', 'session');
}

/**
 * Check if host admin is authenticated
 */
export function isHostAdminAuthenticated(hostId: string): boolean {
  return getStorageValue(`${STORAGE_KEYS.ADMIN_AUTH_PREFIX}${hostId}`, 'session') === 'true';
}

/**
 * Clear host admin authentication
 */
export function clearHostAdminAuth(hostId: string): void {
  removeStorageValue(`${STORAGE_KEYS.ADMIN_AUTH_PREFIX}${hostId}`, 'session');
}

// Helper to check if code is running in browser
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

// Export constants
export { STORAGE_KEYS };