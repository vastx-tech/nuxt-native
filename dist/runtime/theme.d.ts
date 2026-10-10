/**
 * Design tokens shared by every N* component — a single place to retheme
 * the whole kit, and what lets each component ship sensible defaults
 * instead of asking every consumer to specify colors/spacing/radii by hand.
 * Plain hex/rgba strings throughout: NativeScript's `backgroundColor`,
 * `color`, etc. accept `string | Color` directly, no `new Color(...)`
 * construction needed (confirmed against @nativescript/core's View types).
 */
export declare const colors: {
    readonly primary: "#4F46E5";
    readonly primaryText: "#FFFFFF";
    readonly secondary: "#64748B";
    readonly secondaryText: "#FFFFFF";
    readonly danger: "#DC2626";
    readonly dangerText: "#FFFFFF";
    readonly success: "#16A34A";
    readonly successText: "#FFFFFF";
    readonly warning: "#D97706";
    readonly warningText: "#FFFFFF";
    readonly surface: "#FFFFFF";
    readonly background: "#F8FAFC";
    readonly border: "#E2E8F0";
    readonly text: "#0F172A";
    readonly textMuted: "#64748B";
    readonly disabled: "#CBD5E1";
    readonly disabledText: "#94A3B8";
};
export type ThemeColor = 'primary' | 'secondary' | 'danger' | 'success' | 'warning';
export declare const spacing: {
    readonly xs: 4;
    readonly sm: 8;
    readonly md: 12;
    readonly lg: 16;
    readonly xl: 24;
    readonly '2xl': 32;
};
export type Spacing = keyof typeof spacing;
export declare const radii: {
    readonly sm: 6;
    readonly md: 10;
    readonly lg: 16;
    readonly full: 999;
};
export declare const fontSizes: {
    readonly xs: 12;
    readonly sm: 14;
    readonly md: 16;
    readonly lg: 18;
    readonly xl: 22;
    readonly '2xl': 28;
    readonly '3xl': 34;
};
export declare function resolveThemeColor(color: ThemeColor): {
    background: string;
    text: string;
};
