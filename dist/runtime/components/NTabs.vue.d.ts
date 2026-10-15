export interface NTab {
    /** Matches a named slot, <template #[name]>, holding that tab's content. */
    name: string;
    title: string;
    /** Image src for the default tab button: `res://home`, `~/assets/home.png`, a URL. Tinted with the tab colours. */
    icon?: string;
}
/**
 * Tabs that keep every tab alive. All tab contents stay attached to the
 * page and switching only changes which one is visible, so nothing is
 * rebuilt: scroll position, form input and loaded data survive, and a
 * switch costs a visibility change rather than building a page.
 *
 * (Not built on NativeScript's TabView: on Android with bottom tabs it
 * detaches every tab more than one position from the selected one and
 * rebuilds its native views on return — confirmed in @nativescript/core's
 * tab-view/index.android.js, which forces the offscreen limit to 1 unless
 * tabs are at the top. And navigating between pages to switch tabs builds
 * a whole new page every time.)
 *
 * Use it as a page's only content, with the page's own scrolling off, and
 * put a ScrollView inside each tab that needs one:
 *
 *   <NPage :scrollable="false">
 *     <NTabs v-model="tab" :tabs="[{ name: 'explore', title: 'Explore' }, ...]">
 *       <template #explore><ExploreTab /></template>
 *       ...
 *     </NTabs>
 *   </NPage>
 *
 * Pages navigated to from inside a tab (useNativeRouter().navigate) cover
 * the tabs; going back returns to them unchanged. For custom tab buttons
 * (an <NSvg> icon, a badge), use the `tab` slot: <template #tab="{ tab, active }">.
 */
type __VLS_Props = {
    tabs: NTab[];
    /** Selected tab's `name` (v-model). Defaults to the first tab. */
    modelValue?: string;
    position?: 'top' | 'bottom';
    /** Render a tab's content the first time it's selected, rather than all at startup. */
    lazy?: boolean;
    /** Android back button returns to the first tab before leaving the page. */
    backToFirst?: boolean;
    activeColor?: string;
    inactiveColor?: string;
    barColor?: string;
};
declare var __VLS_16: any, __VLS_17: {}, __VLS_31: {
    tab: any;
    active: boolean;
};
type __VLS_Slots = {} & {
    [K in NonNullable<typeof __VLS_16>]?: (props: typeof __VLS_17) => any;
} & {
    tab?: (props: typeof __VLS_31) => any;
};
declare const __VLS_component: import("vue").DefineComponent<__VLS_Props, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    "update:modelValue": (name: string) => any;
    change: (name: string, index: number) => any;
}, string, import("vue").PublicProps, Readonly<__VLS_Props> & Readonly<{
    "onUpdate:modelValue"?: ((name: string) => any) | undefined;
    onChange?: ((name: string, index: number) => any) | undefined;
}>, {
    position: "top" | "bottom";
    modelValue: string;
    lazy: boolean;
    backToFirst: boolean;
    activeColor: string;
    inactiveColor: string;
    barColor: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
