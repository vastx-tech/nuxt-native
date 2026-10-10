import { ref } from "vue";
export function useRemoteImageState() {
  const loading = ref(false);
  const failed = ref(false);
  function onIsLoadingChange(event) {
    loading.value = event.value;
    if (event.value) failed.value = false;
    else failed.value = !event.object.imageSource;
  }
  return { loading, failed, onIsLoadingChange };
}
