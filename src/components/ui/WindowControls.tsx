import React from 'react'

const WindowControls: React.FC = () => {
  // Function to close the window
  const handleClose = () => {
    window.electronAPI.closeWindow();
  }

  // Function to minimize the window
  const handleMinimize = () => {
    window.electronAPI.minimizeWindow();
  }

  // The container serves as the draggable area
  return (
    <div className="window-controls flex justify-between items-center p-2 -app-region-drag">
      {/* Left side - draggable app name */}
      <div className="app-name text-sm font-medium text-white/70">
        Stealth Teleprompter
      </div>
      
      {/* Right side - window controls */}
      <div className="controls flex items-center space-x-2 -app-region-no-drag">
        <button 
          onClick={handleMinimize}
          className="min-button w-4 h-4 rounded-full bg-yellow-500 hover:bg-yellow-400 flex items-center justify-center"
          title="Minimize"
        >
          <span className="icon text-xs opacity-0 hover:opacity-100">_</span>
        </button>
        <button 
          onClick={handleClose}
          className="close-button w-4 h-4 rounded-full bg-red-500 hover:bg-red-400 flex items-center justify-center"
          title="Close"
        >
          <span className="icon text-xs opacity-0 hover:opacity-100">×</span>
        </button>
      </div>
    </div>
  )
}

export default WindowControls
