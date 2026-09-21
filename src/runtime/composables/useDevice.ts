import { Device, Screen } from '@nativescript/core'

export interface NativeDeviceInfo {
  os: 'iOS' | 'Android' | string
  osVersion: string
  model: string
  manufacturer: string
  isIOS: boolean
  isAndroid: boolean
  /** Physical screen size in density-independent pixels. */
  screen: {
    widthDIPs: number
    heightDIPs: number
    scale: number
  }
}

/**
 * Static device/platform info. NativeScript's `Device` is populated once at
 * native process start, so this is plain data rather than a ref — nothing
 * about it changes over the app's lifetime.
 */
export function useDevice(): NativeDeviceInfo {
  return {
    os: Device.os,
    osVersion: Device.osVersion,
    model: Device.model,
    manufacturer: Device.manufacturer,
    isIOS: Device.os === 'iOS',
    isAndroid: Device.os === 'Android',
    screen: {
      widthDIPs: Screen.mainScreen.widthDIPs,
      heightDIPs: Screen.mainScreen.heightDIPs,
      scale: Screen.mainScreen.scale
    }
  }
}
