import { ApplicationSettings } from "@nativescript/core";
export function piniaPersist({ store, options }) {
  if (!options.persist) return;
  const { key = `pinia:${store.$id}`, pick } = options.persist === true ? {} : options.persist;
  if (ApplicationSettings.hasKey(key)) {
    try {
      const saved = JSON.parse(ApplicationSettings.getString(key));
      store.$patch(select(saved, pick));
    } catch {
      ApplicationSettings.remove(key);
    }
  }
  store.$subscribe((_mutation, state) => {
    ApplicationSettings.setString(key, JSON.stringify(select(state, pick)));
  }, { detached: true });
}
function select(state, pick) {
  if (!pick) return state;
  return Object.fromEntries(pick.filter((name) => name in state).map((name) => [name, state[name]]));
}
