export interface NTextProps {
    text?: string;
    /** Typography scale — not raw font sizes, so a theme-wide type change is one edit. */
    variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption' | 'label';
    color?: string;
    weight?: 'normal' | 'medium' | 'semibold' | 'bold';
    align?: 'left' | 'center' | 'right';
    wrap?: boolean;
}
declare const _default: import("vue").DefineComponent<NTextProps, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<NTextProps> & Readonly<{}>, {
    text: string;
    color: string;
    wrap: boolean;
    variant: "h1" | "h2" | "h3" | "body" | "caption" | "label";
    align: "left" | "center" | "right";
    weight: "normal" | "medium" | "semibold" | "bold";
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
