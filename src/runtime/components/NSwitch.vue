<template>
  <Switch
    :checked="modelValue"
    :is-enabled="!disabled"
    :color="color"
    :off-background-color="offColor"
    @checked-change="onCheckedChange"
  />
</template>

<script setup lang="ts">
import { colors } from '../theme'

export interface NSwitchProps {
  modelValue?: boolean
  disabled?: boolean
  color?: string
  offColor?: string
}

withDefaults(defineProps<NSwitchProps>(), {
  modelValue: false,
  disabled: false,
  color: colors.primary,
  offColor: colors.border
})

const emit = defineEmits<{ 'update:modelValue': [value: boolean] }>()

// Switch emits PropertyChangeData on checkedChange, `.value` is the new
// checked state (same PropertyChangeData shape NInput's textChange uses).
function onCheckedChange(args: { value: boolean }) {
  emit('update:modelValue', args.value)
}
</script>
