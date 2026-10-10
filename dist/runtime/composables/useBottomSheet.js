import { $closeModal, $showModal } from "nativescript-vue";
import NBottomSheet from "../components/NBottomSheet.vue";
export function useBottomSheet() {
  function open(content, props) {
    return $showModal(NBottomSheet, {
      fullscreen: false,
      stretched: true,
      props: { content, contentProps: props }
    });
  }
  function close(data) {
    $closeModal(data);
  }
  return { open, close };
}
