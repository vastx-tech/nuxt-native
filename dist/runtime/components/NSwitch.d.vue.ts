export interface NSwitchProps {
    modelValue?: boolean;
    disabled?: boolean;
    color?: string;
    offColor?: string;
}
declare const _default: import("vue").DefineComponent<NSwitchProps, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    "update:modelValue": (value: boolean) => any;
}, string, import("vue").PublicProps, Readonly<NSwitchProps> & Readonly<{
    "onUpdate:modelValue"?: ((value: boolean) => any) | undefined;
}>, {
    disabled: boolean;
    color: string;
    modelValue: boolean;
    offColor: string;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
