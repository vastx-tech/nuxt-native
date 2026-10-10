import { type ThemeColor } from '../theme.js';
export interface NIconButtonProps {
    /** Raw `<svg>...</svg>` markup — see resolveIconSvg() for turning an Iconify name into this. */
    icon: string;
    variant?: ThemeColor | 'outline' | 'ghost';
    size?: 'sm' | 'md' | 'lg';
    disabled?: boolean;
}
declare const _default: import("vue").DefineComponent<NIconButtonProps, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    tap: () => any;
}, string, import("vue").PublicProps, Readonly<NIconButtonProps> & Readonly<{
    onTap?: (() => any) | undefined;
}>, {
    disabled: boolean;
    size: "sm" | "md" | "lg";
    variant: ThemeColor | "outline" | "ghost";
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
