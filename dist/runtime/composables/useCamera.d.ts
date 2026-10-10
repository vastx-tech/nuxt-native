export interface CapturedImage {
    /**
     * Native ImageAsset — pass to <Image :src>, save, or upload. Its `.width`/
     * `.height` are not exposed here directly: ImageAsset only echoes back the
     * requested `options.width`/`options.height` (both optional, so possibly
     * undefined), not the resolved image's actual pixel dimensions — reading
     * those requires the asset's own `getImageAsync()`.
     */
    asset: unknown;
}
export interface TakePictureOptions {
    width?: number;
    height?: number;
    keepAspectRatio?: boolean;
    saveToGallery?: boolean;
    cameraFacing?: 'front' | 'rear';
}
/**
 * Wraps the `@nativescript/camera` plugin. Kept as a peer plugin, the same
 * way useGeolocation() is — camera access pulls in its own native
 * permissions/entitlements that not every app needs.
 */
export declare function useCamera(): {
    requestPermission: () => Promise<boolean>;
    takePicture: (options?: TakePictureOptions) => Promise<CapturedImage>;
};
