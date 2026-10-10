import { onUnmounted, ref } from "vue";
export function useWebSocket(url, options = {}) {
  const connected = ref(false);
  const lastMessage = ref(null);
  const client = new okhttp3.OkHttpClient.Builder().build();
  const request = new okhttp3.Request.Builder().url(url).build();
  const Listener = okhttp3.WebSocketListener.extend({
    init() {
    },
    onOpen(_socket, _response) {
      connected.value = true;
      options.onOpen?.();
    },
    onMessage(_socket, text) {
      lastMessage.value = text;
      options.onMessage?.(text);
    },
    onClosing(socket2, code, reason) {
      socket2.close(code, reason);
    },
    onClosed(_socket, code, reason) {
      connected.value = false;
      options.onClose?.(code, reason);
    },
    onFailure(_socket, throwable, _response) {
      connected.value = false;
      options.onError?.(throwable?.getMessage?.() ?? String(throwable));
    }
  });
  const socket = client.newWebSocket(request, new Listener());
  function send(data) {
    socket.send(data);
  }
  function close(code = 1e3, reason = "closed by client") {
    socket.close(code, reason);
    client.dispatcher().executorService().shutdown();
  }
  onUnmounted(() => close());
  return { connected, lastMessage, send, close };
}
