export interface PersistOptions {
    /** ApplicationSettings key. Default: `pinia:<store id>`. */
    key?: string;
    /** Only save these top-level state keys. Default: all of them. */
    pick?: string[];
}
interface StoreLike {
    $id: string;
    $state: Record<string, unknown>;
    $patch(partial: Record<string, unknown>): void;
    $subscribe(callback: (mutation: unknown, state: Record<string, unknown>) => void, options?: {
        detached?: boolean;
    }): () => void;
}
/**
 * Pinia plugin that saves a store's state on the device and restores it at
 * startup — opt in per store with `persist`:
 *
 *   export const useCartStore = defineStore('cart', () => { ... }, { persist: true })
 *   export const useAuthStore = defineStore('auth', { state: ..., persist: { pick: ['token'] } })
 *
 * Registered automatically by the generated app entry when pinia is
 * installed. Saved as JSON with ApplicationSettings (see useStorage), on
 * every state change, so keep persisted state small and plain.
 */
export declare function piniaPersist({ store, options }: {
    store: StoreLike;
    options: {
        persist?: boolean | PersistOptions;
    };
}): void;
export {};
