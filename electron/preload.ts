import { contextBridge, ipcRenderer } from "electron"
const { shell } = require("electron")

console.log("Preload script starting...")

// Types for the exposed Electron API
interface ElectronAPI {
  toggleMainWindow: () => Promise<{ success: boolean; error?: string }>
  toggleTeleprompter: () => Promise<{ success: boolean; error?: string }>
  setTeleprompterText: (text: string) => Promise<{ success: boolean; error?: string }>
  controlTeleprompter: (action: 'start' | 'stop' | 'reset' | 'toggle', speed?: number) => Promise<{ success: boolean; error?: string }>
  setTeleprompterSpeed: (speed: number) => Promise<{ success: boolean; error?: string }>
  setTeleprompterInteractive: (interactive: boolean) => Promise<{ success: boolean; error?: string }>
  moveTeleprompterLeft: () => Promise<{ success: boolean; error?: string }>
  moveTeleprompterRight: () => Promise<{ success: boolean; error?: string }>
  moveTeleprompterUp: () => Promise<{ success: boolean; error?: string }>
  moveTeleprompterDown: () => Promise<{ success: boolean; error?: string }>
  closeWindow: () => Promise<{ success: boolean; error?: string }>
  minimizeWindow: () => Promise<{ success: boolean; error?: string }>
  getPlatform: () => string
  getEnvVar: (name: string) => Promise<{ success: boolean; error?: string; value?: string }>
  
  // Event listeners
  onUpdateTeleprompterText: (callback: (text: string) => void) => () => void
  onControlTeleprompter: (callback: (data: { action: string; speed?: number }) => void) => () => void
  onSetTeleprompterSpeed: (callback: (speed: number) => void) => () => void
  onSetTeleprompterInteractive: (callback: (interactive: boolean) => void) => () => void
  onFocusScriptInput: (callback: () => void) => () => void
  onToggleGeminiChat: (callback: () => void) => () => void
}

const electronAPI = {
  toggleMainWindow: async () => {
    console.log("toggleMainWindow called from preload")
    try {
      const result = await ipcRenderer.invoke("toggle-window")
      console.log("toggle-window result:", result)
      return result
    } catch (error) {
      console.error("Error in toggleMainWindow:", error)
      throw error
    }
  },
  
  // Window control methods
  closeWindow: () => ipcRenderer.invoke('close-window'),
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  
  // Teleprompter methods
  toggleTeleprompter: () => ipcRenderer.invoke('toggle-teleprompter'),
  setTeleprompterText: (text: string) => ipcRenderer.invoke('set-teleprompter-text', text),
  controlTeleprompter: (action: 'start' | 'stop' | 'reset' | 'toggle', speed?: number) => {
    if (action === 'toggle') {
      // Handle toggle action in renderer with current state
      return Promise.resolve({ success: true })
    }
    return ipcRenderer.invoke('control-teleprompter', action, speed)
  },
  setTeleprompterSpeed: (speed: number) => ipcRenderer.invoke('set-teleprompter-speed', speed),
  setTeleprompterInteractive: (interactive: boolean) => ipcRenderer.invoke('set-teleprompter-interactive', interactive),
  
  // Teleprompter movement methods
  moveTeleprompterLeft: () => ipcRenderer.invoke('move-teleprompter-left'),
  moveTeleprompterRight: () => ipcRenderer.invoke('move-teleprompter-right'),
  moveTeleprompterUp: () => ipcRenderer.invoke('move-teleprompter-up'),
  moveTeleprompterDown: () => ipcRenderer.invoke('move-teleprompter-down'),
  
  getPlatform: () => process.platform,
  
  getEnvVar: async (name: string) => {
    try {
      return await ipcRenderer.invoke('get-env-var', name);
    } catch (error) {
      console.error(`Error getting environment variable ${name}:`, error);
      return { success: false, error: `Failed to get ${name}` };
    }
  },
  
  // Event listeners
  onUpdateTeleprompterText: (callback: (text: string) => void) => {
    const subscription = (_: any, text: string) => callback(text)
    ipcRenderer.on('update-teleprompter-text', subscription)
    return () => {
      ipcRenderer.removeListener('update-teleprompter-text', subscription)
    }
  },
  
  onControlTeleprompter: (callback: (data: { action: string; speed?: number }) => void) => {
    const subscription = (_: any, data: { action: string; speed?: number }) => callback(data)
    ipcRenderer.on('control-teleprompter', subscription)
    return () => {
      ipcRenderer.removeListener('control-teleprompter', subscription)
    }
  },
  
  onSetTeleprompterSpeed: (callback: (speed: number) => void) => {
    const subscription = (_: any, speed: number) => callback(speed)
    ipcRenderer.on('set-teleprompter-speed', subscription)
    return () => {
      ipcRenderer.removeListener('set-teleprompter-speed', subscription)
    }
  },
  
  onSetTeleprompterInteractive: (callback: (interactive: boolean) => void) => {
    const subscription = (_: any, interactive: boolean) => callback(interactive)
    ipcRenderer.on('set-teleprompter-interactive', subscription)
    return () => {
      ipcRenderer.removeListener('set-teleprompter-interactive', subscription)
    }
  },
  
  onFocusScriptInput: (callback: () => void) => {
    const subscription = () => callback()
    ipcRenderer.on('focus-script-input', subscription)
    return () => {
      ipcRenderer.removeListener('focus-script-input', subscription)
    }
  },
  onToggleGeminiChat: (callback: () => void) => {
    const subscription = () => callback()
    ipcRenderer.on('toggle-gemini-chat', subscription)
    return () => {
      ipcRenderer.removeListener('toggle-gemini-chat', subscription)
    }
  }
} as ElectronAPI

// Before exposing the API
console.log("About to expose electronAPI with methods:", Object.keys(electronAPI))

// Add this focus restoration handler
window.addEventListener("focus", () => {
  console.log("Window focused")
})

// Expose the API to the renderer process
contextBridge.exposeInMainWorld("electronAPI", electronAPI)

// Expose platform info
contextBridge.exposeInMainWorld("platform", process.platform)

// Log that preload is complete
console.log("Preload script completed")
