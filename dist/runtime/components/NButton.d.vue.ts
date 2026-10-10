import { type ThemeColor } from '../theme.js';
export interface NButtonProps {
    text?: string;
    variant?: ThemeColor | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
    loading?: boolean;
}
declare var __VLS_14: {};
type __VLS_Slots = {} & {
    default?: (props: typeof __VLS_14) => any;
};
declare const __VLS_component: import("vue").DefineComponent<NButtonProps, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    tap: () => any;
}, string, import("vue").PublicProps, Readonly<NButtonProps> & Readonly<{
    onTap?: (() => any) | undefined;
}>, {
    text: string;
    disabled: boolean;
    size: "sm" | "md" | "lg";
    loading: boolean;
    variant: ThemeColor | "outline" | "ghost";
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
declare const _default: __VLS_WithSlots<typeof __VLS_component, __VLS_Slots>;
export default _default;
type __VLS_WithSlots<T, S> = T & {
    new (): {
        $slots: S;
    };
};
