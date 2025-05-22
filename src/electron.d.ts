interface ElectronAPI {
  toggleMainWindow: () => Promise<{ success: boolean; error?: string }>;
  toggleTeleprompter: () => Promise<{ success: boolean; error?: string }>;
  setTeleprompterText: (text: string) => Promise<{ success: boolean; error?: string }>;
  controlTeleprompter: (action: 'start' | 'stop' | 'reset' | 'toggle', speed?: number) => Promise<{ success: boolean; error?: string }>;
  setTeleprompterSpeed: (speed: number) => Promise<{ success: boolean; error?: string }>;
  setTeleprompterInteractive: (interactive: boolean) => Promise<{ success: boolean; error?: string }>;
  moveTeleprompterLeft: () => Promise<{ success: boolean; error?: string }>;
  moveTeleprompterRight: () => Promise<{ success: boolean; error?: string }>;
  moveTeleprompterUp: () => Promise<{ success: boolean; error?: string }>;
  moveTeleprompterDown: () => Promise<{ success: boolean; error?: string }>;
  closeWindow: () => Promise<{ success: boolean; error?: string }>;
  minimizeWindow: () => Promise<{ success: boolean; error?: string }>;
  getPlatform: () => string;
  getEnvVar: (name: string) => Promise<{ success: boolean; value?: string; error?: string }>;
  
  // Event listeners
  onUpdateTeleprompterText: (callback: (text: string) => void) => () => void;
  onControlTeleprompter: (callback: (data: { action: string; speed?: number }) => void) => () => void;
  onSetTeleprompterSpeed: (callback: (speed: number) => void) => () => void;
  onSetTeleprompterInteractive: (callback: (interactive: boolean) => void) => () => void;
  onFocusScriptInput: (callback: () => void) => () => void;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
    platform: string;
  }
}

export {};
