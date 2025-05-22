import { app, BrowserWindow, screen, shell, ipcMain } from "electron"
import path from "path"
import { initializeIpcHandlers } from "./ipcHandlers"
import { ShortcutsHelper } from "./shortcuts"

// Constants
const isDev = process.env.NODE_ENV === "development" || !app.isPackaged

// Add startup logging
console.log("Application starting...")
console.log("Environment:", isDev ? "Development" : "Production")
console.log("__dirname:", __dirname)
console.log("app.getPath('exe'):", app.getPath('exe'))

// Handle certificate errors in development
if (isDev) {
  app.commandLine.appendSwitch('ignore-certificate-errors')
  app.on('certificate-error', (event, webContents, url, error, certificate, callback) => {
    // Only allow certificate errors in development
    event.preventDefault()
    callback(true)
  })
}

// Application State
const state = {
  // Window management properties
  mainWindow: null as BrowserWindow | null,
  teleprompterWindow: null as BrowserWindow | null,
  isWindowVisible: true,
  windowPosition: null as { x: number; y: number } | null,
  windowSize: null as { width: number; height: number } | null,
  screenWidth: 0,
  screenHeight: 0,
  // Step size for window movement (pixels per keypress)
  moveStep: 20,
  // Window position tracking
  currentX: 0,
  currentY: 0,
  step: 60, // Movement step size in pixels
  teleprompterText: "",
  teleprompterVisible: false,
  teleprompterPosition: null as { x: number; y: number } | null,
  teleprompterSize: null as { width: number; height: number } | null,
  // Application helpers
  shortcutsHelper: null as ShortcutsHelper | null,
}

// Add interfaces for helper classes
export interface IShortcutsHelperDeps {
  getMainWindow: () => BrowserWindow | null
  getTeleprompterWindow: () => BrowserWindow | null
  toggleTeleprompter: () => void
  isVisible: () => boolean
  toggleMainWindow: () => void
  // Teleprompter window movement
  moveTeleprompterLeft: () => void
  moveTeleprompterRight: () => void
  moveTeleprompterUp: () => void
  moveTeleprompterDown: () => void
  // Main window movement with keyboard shortcuts (like interview-coder-no-sub)
  moveWindowLeft: () => void
  moveWindowRight: () => void
  moveWindowUp: () => void
  moveWindowDown: () => void
  // Focus control
  focusScriptInput: () => void
ṅṅgggggggggggggggggggggggggggggg  // Gemini Chat toggle
  toggleGeminiChat: () => void
}

export interface IIpcHandlerDeps {
  getMainWindow: () => BrowserWindow | null
  getTeleprompterWindow: () => BrowserWindow | null
  toggleTeleprompter: () => void
  setTeleprompterText: (text: string) => void
  controlTeleprompter: (action: 'start' | 'stop' | 'reset', speed?: number) => void
  setTeleprompterSpeed: (speed: number) => void
  setTeleprompterInteractive: (interactive: boolean) => void
  toggleMainWindow: () => void
  moveTeleprompterLeft: () => void
  moveTeleprompterRight: () => void
  moveTeleprompterUp: () => void
  moveTeleprompterDown: () => void
}

// Initialize helpers
function initializeHelpers() {
  state.shortcutsHelper = new ShortcutsHelper({
    getMainWindow,
    getTeleprompterWindow,
    toggleTeleprompter,
    isVisible,
    toggleMainWindow,
    moveTeleprompterLeft,
    moveTeleprompterRight,
    moveTeleprompterUp,
    moveTeleprompterDown,
    moveWindowLeft,
    moveWindowRight,
    moveWindowUp,
    moveWindowDown,
    focusScriptInput,
    toggleGeminiChat, // Add this line
  })
}

// Window management functions
async function createWindow(): Promise<void> {
  const primaryDisplay = screen.getPrimaryDisplay()
  const workArea = primaryDisplay.workAreaSize
  state.screenWidth = workArea.width
  state.screenHeight = workArea.height
  
  const width = 800
  const height = 600
  
  // Use the exact same window configuration as interview-coder-no-sub
  state.mainWindow = new BrowserWindow({
    height: 600,
    x: Math.round((workArea.width - width) / 2),
    y: 50,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: isDev
        ? path.join(__dirname, "../dist-electron/preload.js")
        : path.join(__dirname, "preload.js"),
      scrollBounce: true,
      webSecurity: !isDev  // Disable web security in development
    },
    show: true,
    frame: false,
    transparent: true,
    fullscreenable: false,
    hasShadow: false,
    backgroundColor: "#00000000",
    focusable: true,
    skipTaskbar: true,
    type: "panel",
    paintWhenInitiallyHidden: true,
    titleBarStyle: "hidden",
    enableLargerThanScreen: true,
    movable: false // Disable movement by cursor - only use keyboard shortcuts
  })
  
  // Apply content protection to main window too
  state.mainWindow.setContentProtection(true)
  console.log("setContentProtection(true) applied to main window.")
  
  // Track window position and size
  state.currentX = Math.round((workArea.width - width) / 2);
  state.currentY = 50;
  state.step = 60;
  state.windowSize = { width, height };

  // Load the Electron app
  if (isDev) {
    state.mainWindow.loadURL("http://localhost:5173")
    state.mainWindow.webContents.openDevTools({ mode: 'detach' })
  } else {
    state.mainWindow.loadFile(path.join(__dirname, "../dist/index.html"))
  }
  
  state.mainWindow.on('ready-to-show', () => {
    state.mainWindow?.show()
  })
  
  state.mainWindow.on('closed', handleWindowClosed)
  
  state.windowSize = { width, height }
}

// Function to toggle Gemini Chat visibility in the main window
function toggleGeminiChat(): void {
  if (state.mainWindow && !state.mainWindow.isDestroyed()) {
    console.log('Sending toggle-gemini-chat to main window')
    state.mainWindow.webContents.send('toggle-gemini-chat')
  } else {
    console.warn('Cannot toggle Gemini chat, main window not available.')
  }
}

// Create the teleprompter window
async function createTeleprompterWindow(): Promise<void> {
  const primaryDisplay = screen.getPrimaryDisplay()
  const workArea = primaryDisplay.workAreaSize
  
  // Default size for teleprompter - using a larger height to ensure content is fully visible
  const width = 800
  const height = Math.round(workArea.height * 0.9) // Use 90% of the available screen height
  
  // Don't recreate if it already exists
  if (state.teleprompterWindow && !state.teleprompterWindow.isDestroyed()) {
    console.log("Teleprompter window already exists. Showing it.")
    state.teleprompterWindow.show()
    state.teleprompterVisible = true
    return
  }
  
  // Use position from state if available, otherwise use default
  const x = state.teleprompterPosition?.x ?? Math.round((workArea.width - width) / 2)
  const y = state.teleprompterPosition?.y ?? 50
  const teleprompterWidth = state.teleprompterSize?.width ?? width
  const teleprompterHeight = state.teleprompterSize?.height ?? height
  
  console.log(`Creating teleprompter window at position [${x}, ${y}] with size [${teleprompterWidth}, ${teleprompterHeight}]`)
  
  // Create with similar properties to main window, but with a few differences
  state.teleprompterWindow = new BrowserWindow({
    width: teleprompterWidth,
    height: teleprompterHeight,
    x: x,
    y: y,
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: isDev
        ? path.join(__dirname, "../dist-electron/preload.js")
        : path.join(__dirname, "preload.js"),
      scrollBounce: true,
      webSecurity: isDev ? false : true // Disable web security in development
    },
    show: false, // Start hidden, we'll show it after setup
    frame: false,
    transparent: true,
    fullscreenable: true, // Allow full screen for maximum content visibility
    hasShadow: false,
    backgroundColor: "#00000000",
    focusable: true,
    skipTaskbar: true,
    type: "panel",
    paintWhenInitiallyHidden: true,
    titleBarStyle: "hidden",
    enableLargerThanScreen: true,
    autoHideMenuBar: true, // Hide menu bar to maximize content space
    minHeight: height, // Set minimum height to ensure content is visible
  })
  
  // Important - apply content protection immediately
  state.teleprompterWindow.setContentProtection(true)
  console.log("setContentProtection(true) applied to teleprompter window.")
  
  // Load teleprompter URL
  const teleprompterURL = isDev
    ? process.env.VITE_DEV_SERVER_URL_TELEPROMPTER
    : `file://${path.join(__dirname, "../dist/teleprompter.html")}`
  
  console.log(`Loading teleprompter URL: ${teleprompterURL}`)
  try {
    await state.teleprompterWindow.loadURL(teleprompterURL + "#teleprompter")
    console.log("Teleprompter URL loaded successfully.")
  } catch (error) {
    console.error("Failed to load teleprompter URL:", error)
    // Fallback to main URL if teleprompter-specific one fails
    const mainURL = isDev
      ? process.env.VITE_DEV_SERVER_URL
      : `file://${path.join(__dirname, "../dist/index.html")}`
    
    console.log(`Falling back to main URL: ${mainURL}`)
    await state.teleprompterWindow.loadURL(mainURL + "#teleprompter")
  }
  
  // Event handlers
  state.teleprompterWindow.webContents.on("did-finish-load", () => {
    console.log("Teleprompter window finished loading.")
    
    // Show the window (make it visible)
    state.teleprompterWindow?.show()
    state.teleprompterVisible = true
    
    // Set initial text if available
    if (state.teleprompterText) {
      setTeleprompterText(state.teleprompterText)
    }
    
    // Store window bounds
    if (state.teleprompterWindow) {
      const bounds = state.teleprompterWindow.getBounds()
      state.teleprompterPosition = { x: bounds.x, y: bounds.y }
      state.teleprompterSize = { width: bounds.width, height: bounds.height }
    }
  })
  
  state.teleprompterWindow.on("moved", () => {
    // Update position when window is moved
    if (state.teleprompterWindow) {
      const bounds = state.teleprompterWindow.getBounds()
      state.teleprompterPosition = { x: bounds.x, y: bounds.y }
      state.teleprompterSize = { width: bounds.width, height: bounds.height }
      console.log(`Teleprompter window moved to: [${bounds.x}, ${bounds.y}]`)
    }
  })
  
  state.teleprompterWindow.on("closed", () => {
    console.log("Teleprompter window closed.")
    state.teleprompterWindow = null
    state.teleprompterVisible = false
  })
}

function handleWindowClosed(): void {
  state.mainWindow = null
  // If the main window is closed, also close the teleprompter window
  if (state.teleprompterWindow && !state.teleprompterWindow.isDestroyed()) {
    state.teleprompterWindow.close()
    state.teleprompterWindow = null
  }
}

// Window visibility functions
function hideMainWindow(): void {
  if (!state.mainWindow || state.mainWindow.isDestroyed()) {
    console.warn("hideMainWindow called but window doesn't exist.");
    state.isWindowVisible = false; // Ensure state is correct
    return;
  }
  console.log("Hiding main window...");

  // 1. Store current position and size *before* hiding
  try {
    const bounds = state.mainWindow.getBounds();
    state.windowPosition = { x: bounds.x, y: bounds.y };
    state.windowSize = { width: bounds.width, height: bounds.height };
    console.log(`Stored window bounds: x=${bounds.x}, y=${bounds.y}, w=${bounds.width}, h=${bounds.height}`);
  } catch (error) {
    console.error("Error getting window bounds before hiding:", error);
    // Might happen if window is already closing, proceed cautiously
  }

  // 2. Make the window non-interactive (clicks pass through)
  //    Do this *before* making it fully transparent or hiding
  state.mainWindow.setIgnoreMouseEvents(true, { forward: true });
  console.log("Set ignore mouse events to TRUE.");

  // 3. Make it fully transparent (optional, but can help smooth transition)
  state.mainWindow.setOpacity(0);
  console.log("Set opacity to 0.");

  // 4. Hide the window from the screen
  state.mainWindow.hide();
  console.log("Called window.hide().");

  // 5. Update the state variable
  state.isWindowVisible = false;
  console.log("Window hidden. isWindowVisible set to false.");
}

function showMainWindow(): void {
  if (!state.mainWindow || state.mainWindow.isDestroyed()) {
    console.warn("showMainWindow called but window doesn't exist. Attempting to recreate.");
    // If the window was closed/destroyed, we need to recreate it
    createWindow().then(() => {
      // After creation, ensure it's shown correctly
      if (state.mainWindow && !state.mainWindow.isDestroyed()) {
        console.log("Window recreated, now showing.");
        // Apply necessary properties again after creation
        state.mainWindow.setIgnoreMouseEvents(false);
        state.mainWindow.setAlwaysOnTop(true, "screen-saver", 1);
        state.mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
        state.mainWindow.setContentProtection(true); // CRITICAL: Re-apply protection
        state.mainWindow.setOpacity(1); // Make sure it's visible
        state.mainWindow.showInactive(); // Show without stealing focus
        state.isWindowVisible = true;
        console.log("Recreated window shown. isWindowVisible set to true.");
      } else {
        console.error("Failed to recreate or show window after attempt.");
      }
    }).catch(err => {
      console.error("Error recreating window in showMainWindow:", err);
    });
    return; // Exit here as recreation is async
  }

  console.log("Showing main window...");

  // 1. Restore previous position and size (CRITICAL for consistency)
  if (state.windowPosition && state.windowSize) {
    console.log(`Restoring window bounds to: x=${state.windowPosition.x}, y=${state.windowPosition.y}, w=${state.windowSize.width}, h=${state.windowSize.height}`);
    state.mainWindow.setBounds({
      ...state.windowPosition,
      ...state.windowSize,
    });
  } else {
    console.warn("No stored window bounds found, showing at default/current position.");
  }

  // 2. Make the window interactive again
  state.mainWindow.setIgnoreMouseEvents(false);
  console.log("Set ignore mouse events to FALSE.");

  // 3. Re-apply essential "Stealth" and Prompter properties
  state.mainWindow.setAlwaysOnTop(true, "screen-saver", 1); // Keep on top
  state.mainWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true }); // Show everywhere
  state.mainWindow.setContentProtection(true); // CRITICAL: Re-apply content protection
  console.log("Re-applied alwaysOnTop, visibleOnAllWorkspaces, setContentProtection(true).");

  // 4. Show the window without stealing focus
  //    Start transparent and fade in (or just set opacity to 1)
  state.mainWindow.setOpacity(0); // Start transparent
  state.mainWindow.showInactive(); // Show without activating/focusing
  state.mainWindow.setOpacity(1); // Make it visible
  console.log("Called window.showInactive() and set opacity to 1.");

  // 5. Update the state variable
  state.isWindowVisible = true;
  console.log("Window shown. isWindowVisible set to true.");
}

function toggleMainWindow(): void {
  console.log(`Toggling window. Currently visible: ${state.isWindowVisible}`);
  if (state.isWindowVisible) {
    hideMainWindow();
  } else {
    showMainWindow();
  }
}

// Teleprompter functions
function toggleTeleprompter(): void {
  console.log(`Toggling teleprompter. Currently visible: ${state.teleprompterVisible}`);
  if (state.teleprompterVisible) {
    hideTeleprompterWindow();
  } else {
    showTeleprompterWindow();
  }
}

function hideTeleprompterWindow(): void {
  if (!state.teleprompterWindow || state.teleprompterWindow.isDestroyed()) {
    console.warn("hideTeleprompterWindow called but window doesn't exist.");
    state.teleprompterVisible = false; // Ensure state is correct
    return;
  }
  console.log("Hiding teleprompter window...");

  // 1. Store current position and size *before* hiding
  try {
    const bounds = state.teleprompterWindow.getBounds();
    state.teleprompterPosition = { x: bounds.x, y: bounds.y };
    state.teleprompterSize = { width: bounds.width, height: bounds.height };
    console.log(`Stored teleprompter bounds: x=${bounds.x}, y=${bounds.y}, w=${bounds.width}, h=${bounds.height}`);
  } catch (error) {
    console.error("Error getting teleprompter bounds before hiding:", error);
  }

  // 2. Make the window non-interactive (clicks pass through)
  state.teleprompterWindow.setIgnoreMouseEvents(true, { forward: true });
  console.log("Set teleprompter ignore mouse events to TRUE.");

  // 3. Make it fully transparent
  state.teleprompterWindow.setOpacity(0);
  console.log("Set teleprompter opacity to 0.");

  // 4. Hide the window from the screen
  state.teleprompterWindow.hide();
  console.log("Called teleprompter window.hide().");

  // 5. Update the state variable
  state.teleprompterVisible = false;
  console.log("Teleprompter hidden. teleprompterVisible set to false.");
}

function showTeleprompterWindow(): void {
  if (!state.teleprompterWindow || state.teleprompterWindow.isDestroyed()) {
    console.warn("showTeleprompterWindow called but window doesn't exist. Attempting to recreate.");
    // If the window was closed/destroyed, we need to recreate it
    createTeleprompterWindow().then(() => {
      // After creation, ensure it's shown correctly
      if (state.teleprompterWindow && !state.teleprompterWindow.isDestroyed()) {
        console.log("Teleprompter window recreated, now showing.");
        // Apply necessary properties again after creation
        state.teleprompterWindow.setIgnoreMouseEvents(false);
        state.teleprompterWindow.setAlwaysOnTop(true, "screen-saver", 1);
        state.teleprompterWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
        state.teleprompterWindow.setContentProtection(true); // Re-apply protection
        state.teleprompterWindow.setOpacity(1); // Make sure it's visible
        state.teleprompterWindow.showInactive(); // Show without stealing focus
        state.teleprompterVisible = true;
        console.log("Recreated teleprompter window shown. teleprompterVisible set to true.");
      } else {
        console.error("Failed to recreate or show teleprompter window after attempt.");
      }
    }).catch(err => {
      console.error("Error recreating teleprompter window:", err);
    });
    return; // Exit here as recreation is async
  }

  console.log("Showing teleprompter window...");

  // 1. Restore previous position and size (CRITICAL for consistency)
  if (state.teleprompterPosition && state.teleprompterSize) {
    console.log(`Restoring teleprompter bounds to: x=${state.teleprompterPosition.x}, y=${state.teleprompterPosition.y}, w=${state.teleprompterSize.width}, h=${state.teleprompterSize.height}`);
    state.teleprompterWindow.setBounds({
      ...state.teleprompterPosition,
      ...state.teleprompterSize,
    });
  } else {
    console.warn("No stored teleprompter bounds found, showing at default/current position.");
  }

  // 2. Make the window interactive again
  state.teleprompterWindow.setIgnoreMouseEvents(false);
  console.log("Set teleprompter ignore mouse events to FALSE.");

  // 3. Re-apply essential properties
  state.teleprompterWindow.setAlwaysOnTop(true, "screen-saver", 1); // Keep on top
  state.teleprompterWindow.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  state.teleprompterWindow.setContentProtection(true); // Re-apply content protection
  console.log("Re-applied teleprompter alwaysOnTop, visibleOnAllWorkspaces, setContentProtection(true).");

  // 4. Show the window without stealing focus
  state.teleprompterWindow.setOpacity(0); // Start transparent
  state.teleprompterWindow.showInactive(); // Show without activating/focusing
  state.teleprompterWindow.setOpacity(1); // Make it visible
  console.log("Called teleprompter window.showInactive() and set opacity to 1.");

  // 5. Update the state variable
  state.teleprompterVisible = true;
  console.log("Teleprompter window shown. teleprompterVisible set to true.");
}

// Teleprompter window movement functions
function moveTeleprompterLeft(): void {
  if (state.teleprompterWindow && !state.teleprompterWindow.isDestroyed()) {
    const [x, y] = state.teleprompterWindow.getPosition()
    state.teleprompterWindow.setPosition(x - state.moveStep, y)
    console.log(`Moved teleprompter window left to position [${x - state.moveStep}, ${y}]`)
  }
}

function moveTeleprompterRight(): void {
  if (state.teleprompterWindow && !state.teleprompterWindow.isDestroyed()) {
    const [x, y] = state.teleprompterWindow.getPosition()
    state.teleprompterWindow.setPosition(x + state.moveStep, y)
    console.log(`Moved teleprompter window right to position [${x + state.moveStep}, ${y}]`)
  }
}

function moveTeleprompterUp(): void {
  if (state.teleprompterWindow && !state.teleprompterWindow.isDestroyed()) {
    const [x, y] = state.teleprompterWindow.getPosition()
    state.teleprompterWindow.setPosition(x, y - state.moveStep)
    console.log(`Moved teleprompter window up to position [${x}, ${y - state.moveStep}]`)
  }
}

function moveTeleprompterDown(): void {
  if (state.teleprompterWindow && !state.teleprompterWindow.isDestroyed()) {
    const [x, y] = state.teleprompterWindow.getPosition()
    state.teleprompterWindow.setPosition(x, y + state.moveStep)
    console.log(`Moved teleprompter window down to position [${x}, ${y + state.moveStep}]`)
  }
}

function setTeleprompterText(text: string): void {
  if (state.teleprompterWindow && !state.teleprompterWindow.isDestroyed()) {
    state.teleprompterWindow.webContents.send('update-teleprompter-text', text)
  }
}

function controlTeleprompter(action: 'start' | 'stop' | 'reset', speed?: number): void {
  if (state.teleprompterWindow && !state.teleprompterWindow.isDestroyed()) {
    state.teleprompterWindow.webContents.send('control-teleprompter', { action, speed })
  }
}

function setTeleprompterSpeed(speed: number): void {
  if (state.teleprompterWindow && !state.teleprompterWindow.isDestroyed()) {
    state.teleprompterWindow.webContents.send('set-teleprompter-speed', speed)
  }
}

function setTeleprompterInteractive(interactive: boolean): void {
  if (state.teleprompterWindow && !state.teleprompterWindow.isDestroyed()) {
    state.teleprompterWindow.setIgnoreMouseEvents(!interactive, { forward: interactive })
  }
}

// Initialize application
async function initializeApp() {
  try {
    initializeHelpers()
    initializeIpcHandlers({
      getMainWindow,
      getTeleprompterWindow,
      toggleTeleprompter,
      setTeleprompterText,
      controlTeleprompter,
      setTeleprompterSpeed,
      setTeleprompterInteractive,
      toggleMainWindow,
      moveTeleprompterLeft,
      moveTeleprompterRight,
      moveTeleprompterUp,
      moveTeleprompterDown,
    })
    await createWindow()
    state.shortcutsHelper?.registerGlobalShortcuts()
  } catch (error) {
    console.error("Failed to initialize application:", error)
    app.quit()
  }
}

// State getter/setter functions
function getMainWindow(): BrowserWindow | null {
  console.log("Main window created")
  return state.mainWindow
}

function focusScriptInput(): void {
  const mainWindow = getMainWindow()
  if (mainWindow && !mainWindow.isDestroyed()) {
    console.log("Focusing script input from main process")
    // First bring the window to front
    if (!mainWindow.isVisible()) {
      mainWindow.show()
    }
    mainWindow.focus()
    // Then send focus message
    setTimeout(() => {
      mainWindow.webContents.send('focus-script-input')
    }, 100)
  }
}

// Window movement functions - exactly like interview-coder-no-sub
function moveWindowHorizontal(updateFn: (x: number) => number): void {
  if (!state.mainWindow) return;
  state.currentX = updateFn(state.currentX);
  state.mainWindow.setPosition(
    Math.round(state.currentX),
    Math.round(state.currentY)
  );
}

function moveWindowVertical(updateFn: (y: number) => number): void {
  if (!state.mainWindow) return;

  const newY = updateFn(state.currentY);
  // Allow window to go 2/3 off screen in either direction
  const maxUpLimit = (-(state.windowSize?.height || 0) * 2) / 3;
  const maxDownLimit =
    state.screenHeight + ((state.windowSize?.height || 0) * 2) / 3;

  // Only update if within bounds
  if (newY >= maxUpLimit && newY <= maxDownLimit) {
    state.currentY = newY;
    state.mainWindow.setPosition(
      Math.round(state.currentX),
      Math.round(state.currentY)
    );
  }
}

function moveWindowLeft(): void {
  moveWindowHorizontal((x) => Math.max(0, x - state.step));
}

function moveWindowRight(): void {
  moveWindowHorizontal((x) =>
    Math.min(
      state.screenWidth - (state.windowSize?.width || 0) / 2,
      x + state.step
    )
  );
}

function moveWindowUp(): void {
  moveWindowVertical((y) => y - state.step);
}

function moveWindowDown(): void {
  moveWindowVertical((y) => y + state.step);
}

function getTeleprompterWindow(): BrowserWindow | null {
  return state.teleprompterWindow
}

function isVisible(): boolean {
  return state.isWindowVisible
}

// Export state and functions for other modules
export {
  state,
  createWindow,
  hideMainWindow,
  showMainWindow,
  toggleMainWindow,
  getMainWindow,
  getTeleprompterWindow,
  toggleTeleprompter,
  setTeleprompterText,
  controlTeleprompter,
  setTeleprompterSpeed,
  setTeleprompterInteractive,
  moveTeleprompterLeft,
  moveTeleprompterRight,
  moveTeleprompterUp,
  moveTeleprompterDown,
  focusScriptInput,
}

// App lifecycle events
app.whenReady().then(initializeApp)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})
