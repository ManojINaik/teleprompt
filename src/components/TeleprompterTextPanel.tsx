import React, { useRef, useEffect } from 'react'
import { Button } from './ui/button'

interface TeleprompterTextPanelProps {
  teleprompterText: string
  onTextChange: (text: string) => void
  onSetText: () => void
  teleprompterVisible: boolean
  textInputRef?: React.RefObject<HTMLTextAreaElement>
}

const TeleprompterTextPanel: React.FC<TeleprompterTextPanelProps> = ({
  teleprompterText,
  onTextChange,
  onSetText,
  teleprompterVisible,
  textInputRef
}) => {
  // Create a local ref for the textarea element if no external ref is provided
  const localTextareaRef = useRef<HTMLTextAreaElement>(null)
  
  // Use the provided ref or fall back to the local one
  const effectiveRef = textInputRef || localTextareaRef

  // Force focus on component mount
  useEffect(() => {
    if (effectiveRef.current) {
      console.log("Initial focus attempt")
      effectiveRef.current.focus()
    }
  }, [])

  // Set up an effect to listen for IPC message to focus the textarea
  useEffect(() => {
    // Set up the IPC event listener
    const removeListener = window.electronAPI.onFocusScriptInput(() => {
      console.log('Focusing script input from global shortcut')
      forceFocusTextarea()
    })

    // Clean up the listener when component unmounts
    return () => {
      removeListener()
    }
  }, [teleprompterText])

  // Add global keyboard shortcut listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Alt+S shortcut
      if (e.altKey && e.key === 's') {
        console.log('Alt+S keyboard shortcut detected directly')
        e.preventDefault()
        forceFocusTextarea()
      }
      
      // Also check for ctrl+alt+s
      if (e.ctrlKey && e.altKey && e.key === 's') {
        console.log('Ctrl+Alt+S keyboard shortcut detected directly')
        e.preventDefault()
        forceFocusTextarea()
      }
    }

    // Add the event listener
    window.addEventListener('keydown', handleKeyDown)
    
    // Clean up
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  // Helper function to force focus the textarea with multiple approaches
  const forceFocusTextarea = () => {
    if (!effectiveRef.current) {
      console.error("Textarea ref is not available")
      return
    }
    
    // Approach 1: Direct focus
    effectiveRef.current.focus()
    
    // Approach 2: Force blur first, then focus
    effectiveRef.current.blur()
    effectiveRef.current.focus()
    
    // Approach 3: Click then focus
    effectiveRef.current.click()
    effectiveRef.current.focus()
    
    // Approach 4: Use setTimeout to ensure DOM is ready
    setTimeout(() => {
      if (effectiveRef.current) {
        effectiveRef.current.focus()
        
        // Put cursor at end of text
        if (teleprompterText) {
          effectiveRef.current.selectionStart = teleprompterText.length
          effectiveRef.current.selectionEnd = teleprompterText.length
        }
        
        console.log("Focus applied with timeout")
      }
    }, 100)
    
    console.log("Focus attempts completed")
  }

  return (
    <div className="space-y-4">
      <textarea
        ref={effectiveRef}
        value={teleprompterText}
        onChange={(e) => onTextChange(e.target.value)}
        onPaste={(e) => {
          e.preventDefault()
          const pasteText = e.clipboardData.getData('text')
          onTextChange(pasteText)
        }}
        onClick={() => forceFocusTextarea()} // Focus on click too
        className="w-full min-h-[200px] p-3 border rounded-md bg-black/20 text-white border-white/20 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/40"
        placeholder="Enter your script here..."
        autoFocus
        tabIndex={1} // Ensure it gets focus priority
      />
      <Button 
        onClick={onSetText}
        disabled={!teleprompterText.trim() || !teleprompterVisible}
        variant="default"
        className="bg-white/10 hover:bg-white/20 text-white border-white/20"
      >
        Update Teleprompter
      </Button>
      <div className="text-sm text-white/70">
        Tip: Use Alt+S or Ctrl+Alt+S shortcuts to focus this text area without clicking
      </div>
    </div>
  )
}

export default TeleprompterTextPanel
