import { type Spacing } from '../theme.js';
export interface NDividerProps {
    color?: string;
    thickness?: number;
    /** Space above/below (horizontal orientation) or left/right (vertical). */
    margin?: Spacing;
    orientation?: 'horizontal' | 'vertical';
}
declare const _default: import("vue").DefineComponent<NDividerProps, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {}, string, import("vue").PublicProps, Readonly<NDividerProps> & Readonly<{}>, {
    margin: Spacing;
    color: string;
    thickness: number;
    orientation: "horizontal" | "vertical";
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
