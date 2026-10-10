export interface NTab {
    /** Matches a named slot, <template #[name]>, holding that tab's content. */
    name: string;
    title: string;
}
type __VLS_Props = {
    tabs: NTab[];
};
declare var __VLS_23: any, __VLS_24: {};
type __VLS_Slots = {} & {
    [K in NonNullable<typeof __VLS_23>]?: (props: typeof __VLS_24) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{}>, {}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
