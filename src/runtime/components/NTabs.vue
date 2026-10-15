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

<script setup lang="ts">
import { onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { Application, Frame, isAndroid } from '@nativescript/core'
import type { EventData, View } from '@nativescript/core'
import { colors, fontSizes } from '../theme'

export interface NTab {
  /** Matches a named slot, <template #[name]>, holding that tab's content. */
  name: string
  title: string
  /** Image src for the default tab button: `res://home`, `~/assets/home.png`, a URL. Tinted with the tab colours. */
  icon?: string
}

/**
 * Tabs that keep every tab alive. All tab contents stay attached to the
 * page and switching only changes which one is visible, so nothing is
 * rebuilt: scroll position, form input and loaded data survive, and a
 * switch costs a visibility change rather than building a page.
 *
 * (Not built on NativeScript's TabView: on Android with bottom tabs it
 * detaches every tab more than one position from the selected one and
 * rebuilds its native views on return — confirmed in @nativescript/core's
 * tab-view/index.android.js, which forces the offscreen limit to 1 unless
 * tabs are at the top. And navigating between pages to switch tabs builds
 * a whole new page every time.)
 *
 * Use it as a page's only content, with the page's own scrolling off, and
 * put a ScrollView inside each tab that needs one:
 *
 *   <NPage :scrollable="false">
 *     <NTabs v-model="tab" :tabs="[{ name: 'explore', title: 'Explore' }, ...]">
 *       <template #explore><ExploreTab /></template>
 *       ...
 *     </NTabs>
 *   </NPage>
 *
 * Pages navigated to from inside a tab (useNativeRouter().navigate) cover
 * the tabs; going back returns to them unchanged. For custom tab buttons
 * (an <NSvg> icon, a badge), use the `tab` slot: <template #tab="{ tab, active }">.
 */
const props = withDefaults(defineProps<{
  tabs: NTab[]
  /** Selected tab's `name` (v-model). Defaults to the first tab. */
  modelValue?: string
  position?: 'top' | 'bottom'
  /** Render a tab's content the first time it's selected, rather than all at startup. */
  lazy?: boolean
  /** Android back button returns to the first tab before leaving the page. */
  backToFirst?: boolean
  activeColor?: string
  inactiveColor?: string
  barColor?: string
}>(), {
  modelValue: undefined,
  position: 'bottom',
  lazy: true,
  backToFirst: true,
  activeColor: colors.primary,
  inactiveColor: colors.textMuted,
  barColor: colors.surface
})

const emit = defineEmits<{
  'update:modelValue': [name: string]
  'change': [name: string, index: number]
}>()

const root = ref<{ nativeView: View } | null>(null)
const selectedIndex = ref(indexOf(props.modelValue))
const visited = reactive(new Set<string>())

function indexOf(name: string | undefined) {
  const index = props.tabs.findIndex(tab => tab.name === name)
  return index === -1 ? 0 : index
}

/** `notify` is false when the parent already knows (it changed v-model). */
function select(index: number, notify: boolean) {
  const tab = props.tabs[index]
  if (!tab) return
  visited.add(tab.name)
  if (index === selectedIndex.value) return
  selectedIndex.value = index
  if (!notify) return
  emit('update:modelValue', tab.name)
  emit('change', tab.name, index)
}

select(selectedIndex.value, false)

watch(() => props.modelValue, (name) => {
  if (name !== undefined) select(indexOf(name), false)
})

function onBackPressed(args: EventData & { cancel?: boolean }) {
  if (!props.backToFirst || selectedIndex.value === 0) return
  // Only while this tab page is the one on screen: a detail page pushed
  // on top of it handles back itself (returns to the tabs).
  const page = root.value?.nativeView?.page
  if (!page || Frame.topmost()?.currentPage !== page) return
  args.cancel = true
  select(0, true)
}

onMounted(() => {
  if (isAndroid) Application.android.on(Application.android.activityBackPressedEvent, onBackPressed)
})

onBeforeUnmount(() => {
  if (isAndroid) Application.android.off(Application.android.activityBackPressedEvent, onBackPressed)
})
</script>
