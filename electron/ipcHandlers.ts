import { ipcMain } from "electron"
import { IIpcHandlerDeps } from "./main"
import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

// Load environment variables from .env file
const envPath = path.resolve(process.cwd(), '.env')
if (fs.existsSync(envPath)) {
  dotenv.config({ path: envPath })
  console.log('Loaded environment variables from .env file')
}

export function initializeIpcHandlers(deps: IIpcHandlerDeps): void {
  console.log("Initializing IPC handlers (including Teleprompter)")

  // Main window handlers
  ipcMain.handle('toggle-window', () => {
    console.log('IPC: toggle-window received')
    deps.toggleMainWindow()
    return { success: true }
  })

  // Window control handlers
  ipcMain.handle('close-window', () => {
    console.log('IPC: close-window received')
    const mainWindow = deps.getMainWindow()
    if (mainWindow) {
      mainWindow.close()
    }
    return { success: true }
  })

  ipcMain.handle('minimize-window', () => {
    console.log('IPC: minimize-window received')
    const mainWindow = deps.getMainWindow()
    if (mainWindow) {
      mainWindow.minimize()
    }
    return { success: true }
  })

  // Environment variable handler
  ipcMain.handle('get-env-var', (event, name: string) => {
    console.log(`IPC: get-env-var received for ${name}`)
    try {
      const value = process.env[name]
      if (value === undefined) {
        console.log(`Environment variable ${name} not found`)
        return { success: false, error: `Environment variable ${name} not found` }
      }
      console.log(`Retrieved environment variable ${name}`)
      return { success: true, value }
    } catch (error) {
      console.error(`Error retrieving environment variable ${name}:`, error)
      return { success: false, error: `Failed to get environment variable: ${error}` }
    }
  })

  // Teleprompter Handlers
  ipcMain.handle('toggle-teleprompter', () => {
    console.log('IPC: toggle-teleprompter received')
    deps.toggleTeleprompter()
    return { success: true }
  })

  ipcMain.handle('set-teleprompter-text', (event, text: string) => {
    console.log('IPC: set-teleprompter-text received')
    deps.setTeleprompterText(text)
    return { success: true }
  })

  ipcMain.handle('control-teleprompter', (event, action: 'start' | 'stop' | 'reset', speed?: number) => {
    console.log(`IPC: control-teleprompter received: ${action}, speed: ${speed}`)
    deps.controlTeleprompter(action, speed)
    return { success: true }
  })

  ipcMain.handle('set-teleprompter-speed', (event, speed: number) => {
    console.log(`IPC: set-teleprompter-speed received: ${speed}`)
    deps.setTeleprompterSpeed(speed)
    return { success: true }
  })

  ipcMain.handle('set-teleprompter-interactive', (event, interactive: boolean) => {
    console.log(`IPC: set-teleprompter-interactive received: ${interactive}`)
    deps.setTeleprompterInteractive(interactive)
    return { success: true }
  })
  
  // Teleprompter movement handlers
  ipcMain.handle('move-teleprompter-left', () => {
    console.log('IPC: move-teleprompter-left received')
    deps.moveTeleprompterLeft()
    return { success: true }
  })
  
  ipcMain.handle('move-teleprompter-right', () => {
    console.log('IPC: move-teleprompter-right received')
    deps.moveTeleprompterRight()
    return { success: true }
  })
  
  ipcMain.handle('move-teleprompter-up', () => {
    console.log('IPC: move-teleprompter-up received')
    deps.moveTeleprompterUp()
    return { success: true }
  })
  
  ipcMain.handle('move-teleprompter-down', () => {
    console.log('IPC: move-teleprompter-down received')
    deps.moveTeleprompterDown()
    return { success: true }
  })
}
