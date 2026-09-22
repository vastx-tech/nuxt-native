import { $closeModal, $showModal } from 'nativescript-vue'
import NBottomSheet from '../components/NBottomSheet.vue'

/**
 * Shows any component as a bottom sheet: `open(MySheetContent, { props: {
 * ... } })`. NBottomSheet itself is just the backdrop + bottom-anchored
 * card shell shown via $showModal — your own component renders inside it
 * unmodified, and can dismiss itself by importing $closeModal from
 * 'nativescript-vue' directly (or by calling `close()` from here).
 */
export function useBottomSheet() {
  function open<T = unknown>(content: unknown, props?: Record<string, unknown>) {
    return $showModal(NBottomSheet, {
      fullscreen: false,
      stretched: true,
      props: { content, contentProps: props }
    }) as Promise<T | false | undefined>
  }

  function close(data?: unknown) {
    $closeModal(data)
  }

  return { open, close }
}
