import { globalShortcut, app } from "electron"
import { IShortcutsHelperDeps } from "./main"

export class ShortcutsHelper {
  private deps: IShortcutsHelperDeps

  constructor(deps: IShortcutsHelperDeps) {
    this.deps = deps
  }

  public registerGlobalShortcuts(): void {
    // Toggle Main Window - Keep the original Ctrl+B shortcut
    globalShortcut.register("CommandOrControl+B", () => {
      console.log("Shortcut: Toggle Main Window")
      this.deps.toggleMainWindow()
    })

    // Toggle Teleprompter Window
    globalShortcut.register("CommandOrControl+T", () => {
      console.log("Shortcut: Toggle Teleprompter")
      this.deps.toggleTeleprompter()
    })

    // Also keep the old shortcut for compatibility
    globalShortcut.register("CommandOrControl+Alt+T", () => {
      console.log("Shortcut: Toggle Teleprompter (Alt)")
      this.deps.toggleTeleprompter()
    })

    // Start/Stop Teleprompter Scrolling
    globalShortcut.register("CommandOrControl+P", () => {
      console.log("Shortcut: Start/Stop Teleprompter Scroll")
      const teleprompterWindow = this.deps.getTeleprompterWindow()
      if (teleprompterWindow && !teleprompterWindow.isDestroyed()) {
        teleprompterWindow.webContents.send('control-teleprompter', { 
          action: 'toggle' 
        })
      }
    })

    // Also keep the old shortcut for compatibility
    globalShortcut.register("CommandOrControl+Alt+P", () => {
      console.log("Shortcut: Start/Stop Teleprompter Scroll (Alt)")
      const teleprompterWindow = this.deps.getTeleprompterWindow()
      if (teleprompterWindow && !teleprompterWindow.isDestroyed()) {
        teleprompterWindow.webContents.send('control-teleprompter', { 
          action: 'toggle' 
        })
      }
    })

    // Increase Speed
    globalShortcut.register("CommandOrControl+PageUp", () => {
      console.log("Shortcut: Increase Teleprompter Speed")
      const teleprompterWindow = this.deps.getTeleprompterWindow()
      if (teleprompterWindow && !teleprompterWindow.isDestroyed()) {
        teleprompterWindow.webContents.send('control-teleprompter', { 
          action: 'speed_up' 
        })
      }
    })

    // Also keep the old shortcut for compatibility
    globalShortcut.register("CommandOrControl+Alt+Up", () => {
      console.log("Shortcut: Increase Teleprompter Speed (Alt)")
      const teleprompterWindow = this.deps.getTeleprompterWindow()
      if (teleprompterWindow && !teleprompterWindow.isDestroyed()) {
        teleprompterWindow.webContents.send('control-teleprompter', { 
          action: 'speed_up' 
        })
      }
    })

    // Decrease Speed
    globalShortcut.register("CommandOrControl+PageDown", () => {
      console.log("Shortcut: Decrease Teleprompter Speed")
      const teleprompterWindow = this.deps.getTeleprompterWindow()
      if (teleprompterWindow && !teleprompterWindow.isDestroyed()) {
        teleprompterWindow.webContents.send('control-teleprompter', { 
          action: 'speed_down' 
        })
      }
    })

    // Also keep the old shortcut for compatibility
    globalShortcut.register("CommandOrControl+Alt+Down", () => {
      console.log("Shortcut: Decrease Teleprompter Speed (Alt)")
      const teleprompterWindow = this.deps.getTeleprompterWindow()
      if (teleprompterWindow && !teleprompterWindow.isDestroyed()) {
        teleprompterWindow.webContents.send('control-teleprompter', { 
          action: 'speed_down' 
        })
      }
    })
    
    // Window Movement Shortcuts - Exactly like interview-coder-no-sub
    // Keep these original shortcuts for main window movement compatibility
    globalShortcut.register("CommandOrControl+Left", () => {
      console.log("Command/Ctrl + Left pressed. Moving window left.")
      this.deps.moveWindowLeft()
    })

    globalShortcut.register("CommandOrControl+Right", () => {
      console.log("Command/Ctrl + Right pressed. Moving window right.")
      this.deps.moveWindowRight()
    })

    globalShortcut.register("CommandOrControl+Down", () => {
      console.log("Command/Ctrl + Down pressed. Moving window down.")
      this.deps.moveWindowDown()
    })

    globalShortcut.register("CommandOrControl+Up", () => {
      console.log("Command/Ctrl + Up pressed. Moving window up.")
      this.deps.moveWindowUp()
    })

    // Reset Scroll
    globalShortcut.register("CommandOrControl+R", () => {
      console.log("Shortcut: Reset Teleprompter Scroll")
      const teleprompterWindow = this.deps.getTeleprompterWindow()
      if (teleprompterWindow && !teleprompterWindow.isDestroyed()) {
        teleprompterWindow.webContents.send('control-teleprompter', { 
          action: 'reset' 
        })
      }
    })

    // Also keep the old shortcut for compatibility
    globalShortcut.register("CommandOrControl+Alt+R", () => {
      console.log("Shortcut: Reset Teleprompter Scroll (Alt)")
      const teleprompterWindow = this.deps.getTeleprompterWindow()
      if (teleprompterWindow && !teleprompterWindow.isDestroyed()) {
        teleprompterWindow.webContents.send('control-teleprompter', { 
          action: 'reset' 
        })
      }
    })

    // Make Teleprompter Interactive (for setup)
    globalShortcut.register("CommandOrControl+I", () => {
      console.log("Shortcut: Focus on Script Input Field")
      this.deps.focusScriptInput()
    })

    // Focus script input with Ctrl+Alt+S
    globalShortcut.register("CommandOrControl+Alt+S", () => {
      console.log("Shortcut: Focus on Script Input Field (Alt+S)")
      this.deps.focusScriptInput()
    })

    // Register alternative shortcut for Alt+S as a backup
    globalShortcut.register("Alt+S", () => {
      console.log("Shortcut: Focus on Script Input Field (Alt+S alternative)")
      this.deps.focusScriptInput()
    })

    // Also keep the old shortcut for compatibility - now using Alt+I instead of Ctrl+I
    globalShortcut.register("Alt+I", () => {
      console.log("Shortcut: Make Teleprompter Interactive (Alt+I)")
      const teleprompterWindow = this.deps.getTeleprompterWindow()
      if (teleprompterWindow && !teleprompterWindow.isDestroyed()) {
        // Directly set ignore mouse events to false for interactive mode
        teleprompterWindow.setIgnoreMouseEvents(false);
        // Also notify the renderer to update its state
        teleprompterWindow.webContents.send('set-teleprompter-interactive', true)
      }
    })

    // Make Teleprompter Non-Interactive (click-through mode)
    globalShortcut.register("CommandOrControl+N", () => {
      console.log("Shortcut: Make Teleprompter Non-Interactive")
      const teleprompterWindow = this.deps.getTeleprompterWindow()
      if (teleprompterWindow && !teleprompterWindow.isDestroyed()) {
        // Directly set ignore mouse events to true for stealth mode, with forward enabled
        teleprompterWindow.setIgnoreMouseEvents(true, { forward: true });
        // Also notify the renderer to update its state
        teleprompterWindow.webContents.send('set-teleprompter-interactive', false)
      }
    })

    // Also keep the old shortcut for compatibility
    globalShortcut.register("CommandOrControl+Alt+N", () => {
      console.log("Shortcut: Make Teleprompter Non-Interactive (Alt)")
      const teleprompterWindow = this.deps.getTeleprompterWindow()
      if (teleprompterWindow && !teleprompterWindow.isDestroyed()) {
        // Directly set ignore mouse events to true for stealth mode, with forward enabled
        teleprompterWindow.setIgnoreMouseEvents(true, { forward: true });
        // Also notify the renderer to update its state
        teleprompterWindow.webContents.send('set-teleprompter-interactive', false)
      }
    })
    
    // New shortcuts for moving the teleprompter window
    // Move Teleprompter Left
    globalShortcut.register("Alt+Left", () => {
      console.log("Shortcut: Move Teleprompter Left")
      this.deps.moveTeleprompterLeft()
    })
    
    // Move Teleprompter Right
    globalShortcut.register("Alt+Right", () => {
      console.log("Shortcut: Move Teleprompter Right")
      this.deps.moveTeleprompterRight()
    })
    
    // Move Teleprompter Up
    globalShortcut.register("Alt+Up", () => {
      console.log("Shortcut: Move Teleprompter Up")
      this.deps.moveTeleprompterUp()
    })
    
    // Move Teleprompter Down
    globalShortcut.register("Alt+Down", () => {
      console.log("Shortcut: Move Teleprompter Down")
      this.deps.moveTeleprompterDown()
    })
    
    // Also keep the old Control+Arrow shortcuts for compatibility
    globalShortcut.register("Control+Left", () => {
      console.log("Shortcut: Move Teleprompter Left (Control)")
      this.deps.moveTeleprompterLeft()
    })
    
    globalShortcut.register("Control+Right", () => {
      console.log("Shortcut: Move Teleprompter Right (Control)")
      this.deps.moveTeleprompterRight()
    })
    
    globalShortcut.register("Control+Up", () => {
      console.log("Shortcut: Move Teleprompter Up (Control)")
      this.deps.moveTeleprompterUp()
    })
    
    globalShortcut.register("Control+Down", () => {
      console.log("Shortcut: Move Teleprompter Down (Control)")
      this.deps.moveTeleprompterDown()
    })

    // Update Teleprompter with Stealth Mode
    globalShortcut.register("CommandOrControl+U", () => {
      console.log("Shortcut: Update Teleprompter with Stealth Mode")
      const teleprompterWindow = this.deps.getTeleprompterWindow()
      const mainWindow = this.deps.getMainWindow()
      
      if (teleprompterWindow && !teleprompterWindow.isDestroyed() && mainWindow && !mainWindow.isDestroyed()) {
        // First, get the current text from the main window
        mainWindow.webContents.executeJavaScript('document.getElementById("script-input")?.value || document.querySelector("textarea")?.value || ""')
          .then((text) => {
            if (text) {
              // Send the updated text to the teleprompter
              teleprompterWindow.webContents.send('update-teleprompter-text', text)
              console.log("Teleprompter text updated")
              
              // Apply stealth mode (make non-interactive/click-through)
              teleprompterWindow.setIgnoreMouseEvents(true, { forward: true })
              teleprompterWindow.webContents.send('set-teleprompter-interactive', false)
              console.log("Teleprompter set to stealth mode")
            } else {
              console.log("No text found to update teleprompter")
            }
          })
          .catch(err => {
            console.error("Error getting script text:", err)
          })
      }
    })

    // Also provide an alternative shortcut for compatibility
    globalShortcut.register("Alt+U", () => {
      console.log("Shortcut: Update Teleprompter with Stealth Mode (Alt)")
      const teleprompterWindow = this.deps.getTeleprompterWindow()
      const mainWindow = this.deps.getMainWindow()
      
      if (teleprompterWindow && !teleprompterWindow.isDestroyed() && mainWindow && !mainWindow.isDestroyed()) {
        // First, get the current text from the main window
        mainWindow.webContents.executeJavaScript('document.getElementById("script-input")?.value || document.querySelector("textarea")?.value || ""')
          .then((text) => {
            if (text) {
              // Send the updated text to the teleprompter
              teleprompterWindow.webContents.send('update-teleprompter-text', text)
              console.log("Teleprompter text updated")
              
              // Apply stealth mode (make non-interactive/click-through)
              teleprompterWindow.setIgnoreMouseEvents(true, { forward: true })
              teleprompterWindow.webContents.send('set-teleprompter-interactive', false)
              console.log("Teleprompter set to stealth mode")
            } else {
              console.log("No text found to update teleprompter")
            }
          })
          .catch(err => {
            console.error("Error getting script text:", err)
          })
      }
    })

    // Unregister shortcuts when quitting
    app.on("will-quit", () => {
      globalShortcut.unregisterAll()
    })

    // Toggle Gemini Chat Panel
    globalShortcut.register("CommandOrControl+Alt+G", () => {
      console.log("Shortcut: Toggle Gemini Chat Panel")
      this.deps.toggleGeminiChat()
    })
  }
}
