<template>
  <GridLayout rows="*" columns="*" style="width: 100%; height: 100%; backgroundColor: rgba(15, 23, 42, 0.5);" @tap="dismiss">
    <StackLayout verticalAlignment="bottom" :style="sheetStyle" @tap="() => {
}">
      <component :is="content" v-bind="contentProps" />
    </StackLayout>
  </GridLayout>
</template>

<script setup>
import { computed } from "vue";
import { $closeModal } from "nativescript-vue";
import { colors, radii, spacing } from "../theme";
defineProps({
  content: { type: null, required: true },
  contentProps: { type: Object, required: false }
});
const sheetStyle = computed(() => ({
  backgroundColor: colors.surface,
  borderTopLeftRadius: radii.lg,
  borderTopRightRadius: radii.lg,
  padding: spacing.lg
}));
function dismiss() {
  $closeModal(void 0);
}
</script>
