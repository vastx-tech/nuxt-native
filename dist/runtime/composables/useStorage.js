import { effectScope, ref, watch } from "vue";
import { ApplicationSettings } from "@nativescript/core";
const refs = /* @__PURE__ */ new Map();
const scope = effectScope(true);
export function useStorage(key, defaultValue) {
  const existing = refs.get(key);
  if (existing) return existing;
  const state = ref(read(key, defaultValue));
  refs.set(key, state);
  let resetting = false;
  scope.run(() => {
    watch(state, (value) => {
      if (resetting) {
        resetting = false;
        return;
      }
      if (value === void 0) {
        ApplicationSettings.remove(key);
        if (defaultValue !== void 0) {
          resetting = true;
          state.value = copy(defaultValue);
        }
      } else {
        ApplicationSettings.setString(key, JSON.stringify(value));
      }
    }, { deep: true });
  });
  return state;
}
function read(key, defaultValue) {
  if (!ApplicationSettings.hasKey(key)) return copy(defaultValue);
  try {
    return JSON.parse(ApplicationSettings.getString(key));
  } catch {
    return copy(defaultValue);
  }
}
function copy(value) {
  return value === void 0 ? value : JSON.parse(JSON.stringify(value));
}
