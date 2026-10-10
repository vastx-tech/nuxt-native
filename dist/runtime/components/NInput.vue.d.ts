export interface NInputProps {
    modelValue?: string;
    label?: string;
    placeholder?: string;
    secure?: boolean;
    disabled?: boolean;
    error?: string;
    maxLength?: number;
}
declare const _default: import("vue").DefineComponent<NInputProps, {}, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, {
    "update:modelValue": (value: string) => any;
}, string, import("vue").PublicProps, Readonly<NInputProps> & Readonly<{
    "onUpdate:modelValue"?: ((value: string) => any) | undefined;
}>, {
    disabled: boolean;
    modelValue: string;
    label: string;
    placeholder: string;
    secure: boolean;
    error: string;
    maxLength: number;
}, {}, {}, {}, string, import("vue").ComponentProvideOptions, false, {}, any>;
export default _default;
