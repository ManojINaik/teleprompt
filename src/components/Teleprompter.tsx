import React, { useState, useEffect, useRef, useCallback } from 'react'

const Teleprompter: React.FC = () => {
  const [text, setText] = useState<string>("Paste your script here or use the control panel to set text...")
  const [fontSize, setFontSize] = useState<number>(24) // Font size instead of scroll speed
  const [isInteractive, setIsInteractive] = useState<boolean>(false)
  const [containerHeight, setContainerHeight] = useState<number>(0)
  const [contentHeight, setContentHeight] = useState<number>(0)
  const textContainerRef = useRef<HTMLDivElement>(null)
  const textContentRef = useRef<HTMLDivElement>(null)

  // Auto-adjust font size based on content
  useEffect(() => {
    const updateHeights = () => {
      if (textContainerRef.current && textContentRef.current) {
        setContainerHeight(textContainerRef.current.clientHeight);
        setContentHeight(textContentRef.current.scrollHeight);
      }
    };

    // Initial update
    updateHeights();

    // Update on window resize
    window.addEventListener('resize', updateHeights);
    return () => window.removeEventListener('resize', updateHeights);
  }, [text, fontSize]);

  // Auto-adjust font size if content doesn't fit
  useEffect(() => {
    if (contentHeight > containerHeight && fontSize > 12) {
      // Reduce font size automatically to fit content
      setFontSize(prev => Math.max(prev - 1, 12));
    }
  }, [contentHeight, containerHeight, fontSize]);

  // Handle paste event for direct text input
  const handlePaste = useCallback((event: React.ClipboardEvent<HTMLTextAreaElement>) => {
    event.preventDefault()
    const pastedText = event.clipboardData.getData('text')
    setText(pastedText)
  }, [])

  // Make the window interactive or non-interactive
  const makeInteractive = useCallback(() => {
    window.electronAPI.setTeleprompterInteractive(true)
    setIsInteractive(true)
  }, [])

  const makeNonInteractive = useCallback(() => {
    window.electronAPI.setTeleprompterInteractive(false)
    setIsInteractive(false)
  }, [])

  // Font size adjustments
  const increaseFontSize = useCallback(() => {
    setFontSize(prev => Math.min(prev + 2, 72)) // Max font size 72px
  }, [])

  const decreaseFontSize = useCallback(() => {
    setFontSize(prev => Math.max(prev - 2, 12)) // Min font size 12px
  }, [])

  // Listen for control commands from main process
  useEffect(() => {
    const cleanupUpdateText = window.electronAPI.onUpdateTeleprompterText((newText) => {
      setText(newText)
    })

    const cleanupControl = window.electronAPI.onControlTeleprompter((data) => {
      if (data.action === 'speed_up') {
        increaseFontSize()
      } else if (data.action === 'speed_down') {
        decreaseFontSize()
      }
      
      if (data.speed !== undefined) {
        // Convert speed to font size (higher speed = smaller font to fit more)
        const newFontSize = Math.max(72 - data.speed * 3, 12)
        setFontSize(newFontSize)
      }
    })

    const cleanupInteractive = window.electronAPI.onSetTeleprompterInteractive((interactive) => {
      setIsInteractive(interactive)
    })

    return () => {
      cleanupUpdateText?.()
      cleanupControl?.()
      cleanupInteractive?.()
    }
  }, [increaseFontSize, decreaseFontSize])

  // Add keyboard event listeners for this window
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only handle direct keyboard events when the window is interactive
      if (!isInteractive) return;
      
      // Arrow up/down to adjust font size
      if (e.code === 'ArrowUp') {
        e.preventDefault();
        increaseFontSize();
      }
      
      if (e.code === 'ArrowDown') {
        e.preventDefault();
        decreaseFontSize();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isInteractive, increaseFontSize, decreaseFontSize]);

  return (
    <div className="teleprompter-container w-full h-screen bg-transparent overflow-hidden flex flex-col p-0 stealth-mode animation-stealth">
      {/* Optional textarea for direct input - only shown when interactive */}
      {isInteractive && (
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          onPaste={handlePaste}
          onFocus={makeInteractive}
          placeholder="Paste your script here..."
          className="w-full h-24 bg-black bg-opacity-40 border border-gray-600 rounded p-2 mb-2 text-white text-sm resize-none focus:outline-none focus:border-blue-500"
        />
      )}
      
      {/* Main text container with auto-sizing */}
      <div 
        ref={textContainerRef} 
        className="flex-grow flex items-center justify-center p-2 overflow-auto"
      >
        <div 
          ref={textContentRef}
          className="teleprompter-text whitespace-pre-wrap text-center w-full max-h-full stealth-mode"
          style={{ 
            fontSize: `${fontSize}px`, 
            lineHeight: '1.3',
            overflowY: 'visible',
            // Advanced CSS properties to bypass browser tab detection
            transform: 'translateZ(0)',
            WebkitTransform: 'translateZ(0)',
            backfaceVisibility: 'hidden',
            WebkitBackfaceVisibility: 'hidden'
          }}
        >
          {text}
        </div>
      </div>
      
      {/* Debug info if interactive */}
      {isInteractive && contentHeight > containerHeight && (
        <div className="text-xs text-red-500 bg-black bg-opacity-50 p-1 text-center">
          Warning: Content too large. Font size reduced to {fontSize}px. 
          Content height: {contentHeight}px, Container height: {containerHeight}px
        </div>
      )}
      
      {/* Optional controls - only shown when interactive */}
      {isInteractive && (
        <div className="flex justify-center gap-4 p-2 bg-black bg-opacity-40 rounded mt-2">
          <div className="flex items-center gap-2">
            <button 
              onClick={decreaseFontSize}
              className="px-2 py-1 rounded bg-blue-500 text-white"
              title="Decrease text size"
            >
              A-
            </button>
            <span className="text-white text-sm">Font Size: {fontSize}px</span>
            <button 
              onClick={increaseFontSize}
              className="px-2 py-1 rounded bg-blue-500 text-white"
              title="Increase text size"
            >
              A+
            </button>
          </div>
          <button 
            onClick={makeNonInteractive}
            className="px-4 py-1 rounded bg-purple-500 text-white"
          >
            Go Stealth
          </button>
        </div>
      )}
    </div>
  )
}

export default Teleprompter
