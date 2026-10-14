<template>
  <GridLayout ref="root" :rows="position === 'top' ? 'auto, *' : '*, auto'">
    <GridLayout :row="position === 'top' ? 1 : 0">
      <!-- One layer per tab, all kept attached; switching only flips
           visibility. Content is rendered on first visit (lazy) and kept. -->
      <GridLayout
        v-for="(tab, index) in tabs"
        :key="tab.name"
        :visibility="index === selectedIndex ? 'visible' : 'collapse'"
      >
        <slot v-if="!lazy || visited.has(tab.name)" :name="tab.name" />
      </GridLayout>
    </GridLayout>

    <GridLayout
      :row="position === 'top' ? 0 : 1"
      :columns="tabs.map(() => '*').join(', ')"
      :backgroundColor="barColor"
      :borderTopWidth="position === 'top' ? 0 : 1"
      :borderBottomWidth="position === 'top' ? 1 : 0"
      :borderColor="colors.border"
    >
      <StackLayout
        v-for="(tab, index) in tabs"
        :key="tab.name"
        :col="index"
        paddingTop="8"
        paddingBottom="8"
        horizontalAlignment="stretch"
        accessible="true"
        :accessibilityLabel="tab.title"
        @tap="select(index, true)"
      >
        <slot name="tab" :tab="tab" :active="index === selectedIndex">
          <Image
            v-if="tab.icon"
            :src="tab.icon"
            width="24"
            height="24"
            horizontalAlignment="center"
            :tintColor="index === selectedIndex ? activeColor : inactiveColor"
          />
          <Label
            :text="tab.title"
            :fontSize="fontSizes.xs"
            :fontWeight="index === selectedIndex ? 'bold' : 'normal'"
            :color="index === selectedIndex ? activeColor : inactiveColor"
            horizontalAlignment="center"
            textAlignment="center"
          />
        </slot>
      </StackLayout>
    </GridLayout>
  </GridLayout>
</template>

<script setup>
import { onBeforeUnmount, onMounted, reactive, ref, watch } from "vue";
import { Application, Frame, isAndroid } from "@nativescript/core";
import { colors, fontSizes } from "../theme";
const props = defineProps({
  tabs: { type: Array, required: true },
  modelValue: { type: String, required: false },
  position: { type: String, required: false, default: "bottom" },
  lazy: { type: Boolean, required: false, default: true },
  backToFirst: { type: Boolean, required: false, default: true },
  activeColor: { type: String, required: false, default: colors.primary },
  inactiveColor: { type: String, required: false, default: colors.textMuted },
  barColor: { type: String, required: false, default: colors.surface }
});
const emit = defineEmits(["update:modelValue", "change"]);
const root = ref(null);
const selectedIndex = ref(indexOf(props.modelValue));
const visited = reactive(/* @__PURE__ */ new Set());
function indexOf(name) {
  const index = props.tabs.findIndex((tab) => tab.name === name);
  return index === -1 ? 0 : index;
}
function select(index, notify) {
  const tab = props.tabs[index];
  if (!tab) return;
  visited.add(tab.name);
  if (index === selectedIndex.value) return;
  selectedIndex.value = index;
  if (!notify) return;
  emit("update:modelValue", tab.name);
  emit("change", tab.name, index);
}
select(selectedIndex.value, false);
watch(() => props.modelValue, (name) => {
  if (name !== void 0) select(indexOf(name), false);
});
function onBackPressed(args) {
  if (!props.backToFirst || selectedIndex.value === 0) return;
  const page = root.value?.nativeView?.page;
  if (!page || Frame.topmost()?.currentPage !== page) return;
  args.cancel = true;
  select(0, true);
}
onMounted(() => {
  if (isAndroid) Application.android.on(Application.android.activityBackPressedEvent, onBackPressed);
});
onBeforeUnmount(() => {
  if (isAndroid) Application.android.off(Application.android.activityBackPressedEvent, onBackPressed);
});
</script>
