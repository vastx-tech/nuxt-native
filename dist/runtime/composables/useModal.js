import { $closeModal, $showModal } from "nativescript-vue";
export function useModal() {
  function open(component, options) {
    return $showModal(component, options);
  }
  function close(data) {
    $closeModal(data);
  }
  return { open, close };
}
