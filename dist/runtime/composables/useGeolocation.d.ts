export interface GeoPosition {
    latitude: number;
    longitude: number;
    altitude: number | null;
    accuracy: number;
    timestamp: number;
}
export type GeoAccuracy = 'high' | 'any';
export interface GetLocationOptions {
    accuracy?: GeoAccuracy;
    /** Milliseconds before giving up. */
    timeout?: number;
}
/**
 * Wraps the `@nativescript/geolocation` plugin. It's a peer plugin rather
 * than a bundled dependency — most apps that don't need location shouldn't
 * pay for the native permission prompts/entitlements it requires.
 */
export declare function useGeolocation(): {
    requestPermission: () => Promise<boolean>;
    getCurrentPosition: (options?: GetLocationOptions) => Promise<GeoPosition>;
};
