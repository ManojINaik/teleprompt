// Platform detection utility to display correct keyboard shortcuts
const getPlatform = () => {
  try {
    // Use the exposed API if available
    return window.electronAPI?.getPlatform() || 'win32';
  } catch {
    // Fallback if API isn't ready or available
    return 'win32';
  }
}

export const COMMAND_KEY = getPlatform() === 'darwin' ? '⌘' : 'Ctrl';
export const ALT_KEY = getPlatform() === 'darwin' ? '⌥' : 'Alt';
export const SHIFT_KEY = 'Shift'; // Usually the same symbol/word
export const ARROW_UP = '↑';
export const ARROW_DOWN = '↓';
export const ARROW_LEFT = '←';
export const ARROW_RIGHT = '→';

// Helper function to format keyboard shortcuts
export const getShortcutString = (keys: string[]): string => {
  return keys.join(' + ');
};
