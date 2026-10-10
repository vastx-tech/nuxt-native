import { onUnmounted, ref } from "vue";
export function useWebSocket(url, options = {}) {
  const connected = ref(false);
  const lastMessage = ref(null);
  const nsUrl = NSURL.URLWithString(url);
  const session = NSURLSession.sessionWithConfigurationDelegateDelegateQueue(
    NSURLSessionConfiguration.defaultSessionConfiguration,
    NSURLSessionWebSocketDelegateImpl.new().initWithCallbacks(
      () => {
        connected.value = true;
        options.onOpen?.();
      },
      (code, reason) => {
        connected.value = false;
        options.onClose?.(code, reason);
      }
    ),
    null
  );
  const task = session.webSocketTaskWithURL(nsUrl);
  function receiveLoop() {
    task.receiveMessageWithCompletionHandler((message, error) => {
      if (error) {
        connected.value = false;
        options.onError?.(error.localizedDescription);
        return;
      }
      if (message?.string) {
        lastMessage.value = message.string;
        options.onMessage?.(message.string);
      }
      receiveLoop();
    });
  }
  task.resume();
  receiveLoop();
  function send(data) {
    const message = NSURLSessionWebSocketMessage.alloc().initWithString(data);
    task.sendMessageCompletionHandler(message, (error) => {
      if (error) options.onError?.(error.localizedDescription);
    });
  }
  function close(code = 1e3, reason = "closed by client") {
    const reasonData = NSString.stringWithString(reason).dataUsingEncoding(NSUTF8StringEncoding);
    task.cancelWithCloseCodeReason(code, reasonData);
  }
  onUnmounted(() => close());
  return { connected, lastMessage, send, close };
}
const NSURLSessionWebSocketDelegateImpl = NSObject.extend(
  {
    onOpenCallback: null,
    onCloseCallback: null,
    initWithCallbacks(onOpen, onClose) {
      this.onOpenCallback = onOpen;
      this.onCloseCallback = onClose;
      return this;
    },
    URLSessionWebSocketTaskDidOpenWithProtocol(_session, _task, _protocol) {
      this.onOpenCallback?.();
    },
    URLSessionWebSocketTaskDidCloseWithCodeReason(_session, _task, code, reason) {
      const reasonString = reason ? NSString.alloc().initWithDataEncoding(reason, NSUTF8StringEncoding).toString() : "";
      this.onCloseCallback?.(code, reasonString);
    }
  },
  { interfaces: [NSURLSessionWebSocketDelegate] }
);
