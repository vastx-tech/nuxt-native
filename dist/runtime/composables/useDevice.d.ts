export interface NativeDeviceInfo {
    os: 'iOS' | 'Android' | string;
    osVersion: string;
    model: string;
    manufacturer: string;
    isIOS: boolean;
    isAndroid: boolean;
    /** Physical screen size in density-independent pixels. */
    screen: {
        widthDIPs: number;
        heightDIPs: number;
        scale: number;
    };
}
/**
 * Static device/platform info. NativeScript's `Device` is populated once at
 * native process start, so this is plain data rather than a ref — nothing
 * about it changes over the app's lifetime.
 */
export declare function useDevice(): NativeDeviceInfo;
