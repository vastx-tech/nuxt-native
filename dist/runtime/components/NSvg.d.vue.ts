export interface NSvgProps {
    /** A `~/`-relative file path, a URL, or raw `<svg>...</svg>` markup. */
    src: string;
    stretch?: 'none' | 'aspectFit' | 'aspectFill' | 'fill';
}
declare const _default: import("vue").DefineComponent<NSvgProps, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<NSvgProps> & Readonly<{}>, {
    stretch: "none" | "aspectFit" | "aspectFill" | "fill";
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
