import { Device, Screen } from "@nativescript/core";
export function useDevice() {
  return {
    os: Device.os,
    osVersion: Device.osVersion,
    model: Device.model,
    manufacturer: Device.manufacturer,
    isIOS: Device.os === "iOS",
    isAndroid: Device.os === "Android",
    screen: {
      widthDIPs: Screen.mainScreen.widthDIPs,
      heightDIPs: Screen.mainScreen.heightDIPs,
      scale: Screen.mainScreen.scale
    }
  };
}
