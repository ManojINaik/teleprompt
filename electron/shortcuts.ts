import { globalShortcut, app } from "electron"
import { IShortcutsHelperDeps } from "./main"

export class ShortcutsHelper {
  private deps: IShortcutsHelperDeps

  constructor(deps: IShortcutsHelperDeps) {
    this.deps = deps
  }

  public registerGlobalShortcuts(): void {
    // Toggle Main Window
    globalShortcut.register("CommandOrControl+B", () => {
      console.log("Shortcut: Toggle Main Window")
      this.deps.toggleMainWindow()
    })

    // Toggle Teleprompter Window
    globalShortcut.register("CommandOrControl+Alt+T", () => {
      console.log("Shortcut: Toggle Teleprompter")
      this.deps.toggleTeleprompter()
    })

    // Start/Stop Teleprompter Scrolling
    globalShortcut.register("CommandOrControl+Alt+P", () => {
      console.log("Shortcut: Start/Stop Teleprompter Scroll")
      const teleprompterWindow = this.deps.getTeleprompterWindow()
      if (teleprompterWindow && !teleprompterWindow.isDestroyed()) {
        teleprompterWindow.webContents.send('control-teleprompter', { 
          action: 'toggle' 
        })
      }
    })

    // Increase Speed
    globalShortcut.register("CommandOrControl+Alt+Up", () => {
      console.log("Shortcut: Increase Teleprompter Speed")
      const teleprompterWindow = this.deps.getTeleprompterWindow()
      if (teleprompterWindow && !teleprompterWindow.isDestroyed()) {
        teleprompterWindow.webContents.send('control-teleprompter', { 
          action: 'speed_up' 
        })
      }
    })

    // Decrease Speed
    globalShortcut.register("CommandOrControl+Alt+Down", () => {
      console.log("Shortcut: Decrease Teleprompter Speed")
      const teleprompterWindow = this.deps.getTeleprompterWindow()
      if (teleprompterWindow && !teleprompterWindow.isDestroyed()) {
        teleprompterWindow.webContents.send('control-teleprompter', { 
          action: 'speed_down' 
        })
      }
    })
    
    // Window Movement Shortcuts - Exactly like interview-coder-no-sub
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
    globalShortcut.register("CommandOrControl+Alt+R", () => {
      console.log("Shortcut: Reset Teleprompter Scroll")
      const teleprompterWindow = this.deps.getTeleprompterWindow()
      if (teleprompterWindow && !teleprompterWindow.isDestroyed()) {
        teleprompterWindow.webContents.send('control-teleprompter', { 
          action: 'reset' 
        })
      }
    })

    // Make Teleprompter Interactive (for setup)
    globalShortcut.register("CommandOrControl+Alt+I", () => {
      console.log("Shortcut: Make Teleprompter Interactive")
      const teleprompterWindow = this.deps.getTeleprompterWindow()
      if (teleprompterWindow && !teleprompterWindow.isDestroyed()) {
        // Directly set ignore mouse events to false for interactive mode
        teleprompterWindow.setIgnoreMouseEvents(false);
        // Also notify the renderer to update its state
        teleprompterWindow.webContents.send('set-teleprompter-interactive', true)
      }
    })

    // Make Teleprompter Non-Interactive (click-through mode)
    globalShortcut.register("CommandOrControl+Alt+N", () => {
      console.log("Shortcut: Make Teleprompter Non-Interactive")
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
    globalShortcut.register("Control+Left", () => {
      console.log("Shortcut: Move Teleprompter Left")
      this.deps.moveTeleprompterLeft()
    })
    
    // Move Teleprompter Right
    globalShortcut.register("Control+Right", () => {
      console.log("Shortcut: Move Teleprompter Right")
      this.deps.moveTeleprompterRight()
    })
    
    // Move Teleprompter Up
    globalShortcut.register("Control+Up", () => {
      console.log("Shortcut: Move Teleprompter Up")
      this.deps.moveTeleprompterUp()
    })
    
    // Move Teleprompter Down
    globalShortcut.register("Control+Down", () => {
      console.log("Shortcut: Move Teleprompter Down")
      this.deps.moveTeleprompterDown()
    })

    // Unregister shortcuts when quitting
    app.on("will-quit", () => {
      globalShortcut.unregisterAll()
    })
  }
}
