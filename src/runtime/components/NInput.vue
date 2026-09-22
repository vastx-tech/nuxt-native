<template>
  <StackLayout>
    <Label v-if="label" :text="label" :style="labelStyle" />
    <TextField
      :text="modelValue"
      :hint="placeholder"
      :secure="secure"
      :editable="!disabled"
      :max-length="maxLength"
      :style="fieldStyle"
      @text-change="onTextChange"
    />
    <Label v-if="error" :text="error" :style="errorStyle" />
  </StackLayout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { colors, fontSizes, radii, spacing } from '../theme'

export interface NInputProps {
  modelValue?: string
  label?: string
  placeholder?: string
  secure?: boolean
  disabled?: boolean
  error?: string
  maxLength?: number
}

const props = withDefaults(defineProps<NInputProps>(), {
  modelValue: '',
  label: undefined,
  placeholder: undefined,
  secure: false,
  disabled: false,
  error: undefined,
  maxLength: undefined
})

const emit = defineEmits<{ 'update:modelValue': [value: string] }>()

const labelStyle = {
  fontSize: fontSizes.sm,
  fontWeight: '600',
  color: colors.text,
  marginBottom: spacing.xs
}

const fieldStyle = computed(() => ({
  backgroundColor: props.disabled ? colors.disabled : colors.surface,
  color: props.disabled ? colors.disabledText : colors.text,
  borderColor: props.error ? colors.danger : colors.border,
  borderWidth: 1,
  borderRadius: radii.sm,
  padding: spacing.sm,
  fontSize: fontSizes.md
}))

const errorStyle = {
  fontSize: fontSizes.xs,
  color: colors.danger,
  marginTop: spacing.xs
}

// NativeScript's TextField emits PropertyChangeData on textChange, whose
// `.value` is the field's new text (confirmed against
// @nativescript/core's EditableTextBase/PropertyChangeData types) — not a
// DOM-style Event, so there's no `.target.value` to reach for here.
function onTextChange(args: { value: string }) {
  emit('update:modelValue', args.value)
}
</script>
