/**
 * Shows any component as a bottom sheet: `open(MySheetContent, { props: {
 * ... } })`. NBottomSheet itself is just the backdrop + bottom-anchored
 * card shell shown via $showModal — your own component renders inside it
 * unmodified, and can dismiss itself by importing $closeModal from
 * 'nativescript-vue' directly (or by calling `close()` from here).
 */
export declare function useBottomSheet(): {
    open: <T = unknown>(content: unknown, props?: Record<string, unknown>) => Promise<T | false | undefined>;
    close: (data?: unknown) => void;
};
