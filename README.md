# Stealth Teleprompter

A teleprompter application built with Electron and React that's designed to be undetectable during screen sharing sessions. Leverages Electron's `setContentProtection(true)` API to prevent screen capture applications from recording the teleprompter window.

## Key Features

- **Stealth Mode**: The teleprompter window uses `setContentProtection(true)` to prevent it from being captured in screen recordings
- **Transparent Background**: Frameless, transparent window blends in with any content behind it
- **Always On Top**: Stays above other applications for visibility
- **Click-Through Mode**: Can ignore mouse events to allow interaction with windows underneath
- **Keyboard Shortcuts**: Full control via keyboard shortcuts for seamless operation
- **Speed Control**: Adjustable scrolling speed for your script
- **Two Window System**: Separate control panel and teleprompter windows

## Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| Ctrl+Alt+T | Toggle Teleprompter Window |
| Ctrl+Alt+P | Start/Stop Scrolling |
| Ctrl+Alt+R | Reset Position |
| Ctrl+Alt+Up | Increase Speed |
| Ctrl+Alt+Down | Decrease Speed |
| Ctrl+Alt+I | Make Interactive (for setup) |
| Ctrl+Alt+N | Make Non-Interactive (click-through) |
| Ctrl+B | Toggle Control Panel |

## Technical Details

This application uses:
- Electron for cross-platform desktop functionality
- React with TypeScript for the UI
- TailwindCSS for styling
- Inter-process communication (IPC) for communication between windows

## Important Limitations

- **Hardware Capture**: No software solution can prevent capture via external hardware (e.g., HDMI capture cards)
- **Platform Specific**: The effectiveness of `setContentProtection` varies by operating system
  - macOS: Uses NSWindowSharingNone
  - Windows: Uses WDA_MONITOR
  - Linux: Varies by desktop environment

## Getting Started

### Development

```bash
npm install
npm run dev
```

### Building

```bash
npm run build
```

## Usage

1. Launch the application
2. Enter your script in the control panel
3. Click "Update Teleprompter Text" to send to the teleprompter window
4. Use Ctrl+Alt+T to show the teleprompter window
5. Position the window where needed (use Ctrl+Alt+I to make it interactive first)
6. Use Ctrl+Alt+N to make it click-through once positioned
7. Control scrolling with Ctrl+Alt+P to start/stop
#   t e l e p r o m p t  
 