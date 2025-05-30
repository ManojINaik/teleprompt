import React, { useState, useCallback, useEffect, useRef } from 'react'
import { COMMAND_KEY, ALT_KEY, ARROW_UP, ARROW_DOWN, ARROW_LEFT, ARROW_RIGHT, getShortcutString } from '../utils/platform'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card'
import GeminiChat from './GeminiChat'
import TeleprompterControls from './TeleprompterControls'
import TeleprompterTextPanel from './TeleprompterTextPanel'
import WindowControls from './ui/WindowControls'

const Home: React.FC = () => {
  const [teleprompterText, setTeleprompterText] = useState<string>('')
  const [fontSize, setFontSize] = useState<number>(24) 
  const [teleprompterVisible, setTeleprompterVisible] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<'teleprompter' | 'chat'>('teleprompter')
  // Create a ref to the text input that we can pass to the TeleprompterTextPanel
  const textInputRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    // We could add an IPC method to check if teleprompter window exists/is visible
    // For now we'll just assume it's not visible on first load
  }, [])

  const handleToggleTeleprompter = useCallback(async () => {
    try {
      await window.electronAPI.toggleTeleprompter()
      setTeleprompterVisible(prev => !prev)
    } catch (error) {
      console.error('Failed to toggle teleprompter:', error)
    }
  }, [])

  const handleSetText = useCallback(async () => {
    try {
      await window.electronAPI.setTeleprompterText(teleprompterText)
    } catch (error) {
      console.error('Failed to set teleprompter text:', error)
    }
  }, [teleprompterText])

  const handleMakeInteractive = useCallback(async (interactive: boolean) => {
    try {
      await window.electronAPI.setTeleprompterInteractive(interactive)
    } catch (error) {
      console.error(`Failed to set teleprompter interactive mode to ${interactive}:`, error)
    }
  }, [])

  const handleFontSizeChange = useCallback(async (newSize: number) => {
    setFontSize(newSize)
    try {
      const calculatedSpeed = Math.max(1, Math.min(20, Math.floor((72 - newSize) / 3)))
      await window.electronAPI.setTeleprompterSpeed(calculatedSpeed)
    } catch (error) {
      console.error('Failed to set teleprompter font size:', error)
    }
  }, [])

  const handleMoveTeleprompter = useCallback(async (direction: 'left' | 'right' | 'up' | 'down') => {
    try {
      switch (direction) {
        case 'left':
          await window.electronAPI.moveTeleprompterLeft();
          break;
        case 'right':
          await window.electronAPI.moveTeleprompterRight();
          break;
        case 'up':
          await window.electronAPI.moveTeleprompterUp();
          break;
        case 'down':
          await window.electronAPI.moveTeleprompterDown();
          break;
      }
    } catch (error) {
      console.error(`Failed to move teleprompter ${direction}:`, error);
    }
  }, []);

  // Add direct keyboard shortcut handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Handle Alt+S
      if (e.altKey && e.key === 's') {
        e.preventDefault()
        console.log('Alt+S detected in Home component')
        focusTextInput()
      }
      // Also handle Ctrl+Alt+S
      if (e.ctrlKey && e.altKey && e.key === 's') {
        e.preventDefault()
        console.log('Ctrl+Alt+S detected in Home component')
        focusTextInput()
      }
    }
    
    // Listen for IPC event to focus input
    const removeFocusListener = window.electronAPI.onFocusScriptInput(() => {
      console.log('Focus script input IPC received in Home')
      focusTextInput()
    })
    
    window.addEventListener('keydown', handleKeyDown)
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      removeFocusListener()
    }
  }, [])

  // Listen for Gemini Chat toggle IPC event
  useEffect(() => {
    const removeGeminiChatToggleListener = window.electronAPI.onToggleGeminiChat(() => {
      console.log('Toggle Gemini Chat IPC received in Home')
      setActiveTab(prevTab => prevTab === 'chat' ? 'teleprompter' : 'chat')
    })

    return () => {
      removeGeminiChatToggleListener()
    }
  }, [])

  // Helper function to focus the text input
  const focusTextInput = () => {
    console.log('Attempting to focus text input, ref exists:', !!textInputRef.current)
    if (textInputRef.current) {
      // Force any blur first
      textInputRef.current.blur()
      // Then try multiple focus methods
      textInputRef.current.focus()
      // For good measure, try setting the tab index
      textInputRef.current.tabIndex = 1
      
      // Simulate a click
      textInputRef.current.click()
      
      // Try with a setTimeout as well
      setTimeout(() => {
        if (textInputRef.current) {
          textInputRef.current.focus()
          console.log('Focus applied with timeout')
        }
      }, 100)
      
      console.log('Focus attempts complete')
    }
  }

  const shortcuts = {
    toggleTeleprompter: getShortcutString([COMMAND_KEY, ALT_KEY, 'T']),
    makeInteractive: getShortcutString([COMMAND_KEY, ALT_KEY, 'I']),
    makeNonInteractive: getShortcutString([COMMAND_KEY, ALT_KEY, 'N']),
    increaseFontSize: getShortcutString([COMMAND_KEY, ALT_KEY, ARROW_UP]),
    decreaseFontSize: getShortcutString([COMMAND_KEY, ALT_KEY, ARROW_DOWN]),
    toggleControlPanel: getShortcutString([COMMAND_KEY, 'B']),
    moveLeft: getShortcutString(['Ctrl', ARROW_LEFT]),
    moveRight: getShortcutString(['Ctrl', ARROW_RIGHT]),
    moveUp: getShortcutString(['Ctrl', ARROW_UP]),
    moveDown: getShortcutString(['Ctrl', ARROW_DOWN]),
    toggleGeminiChat: getShortcutString([COMMAND_KEY, ALT_KEY, 'G'])
  }

  return (
    <div className="min-h-screen bg-transparent backdrop-blur-sm">
      <WindowControls />
      <div className="p-8">
        {/* Tab Navigation */}
        <div className="mb-6 flex border-b border-white/20">
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'teleprompter' ? 'text-white border-b-2 border-white' : 'text-white/60 hover:text-white/80'}`}
            onClick={() => setActiveTab('teleprompter')}
          >
            Teleprompter
          </button>
          <button
            className={`px-4 py-2 font-medium ${activeTab === 'chat' ? 'text-white border-b-2 border-white' : 'text-white/60 hover:text-white/80'}`}
            onClick={() => setActiveTab('chat')}
          >
            Gemini Chat
          </button>
        </div>
      {activeTab === 'teleprompter' && (
        <>
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-white">Stealth Teleprompter</h1>
            <p className="text-white/70 mt-2">
              A teleprompter that's undetectable during screen sharing
            </p>
          </header>

          <Card className="mb-6 bg-black/40 backdrop-blur-md border-white/10 text-white shadow-lg">
            <CardHeader>
              <CardTitle>Teleprompter Controls</CardTitle>
            </CardHeader>
            
            <CardContent>
              <TeleprompterControls 
                teleprompterVisible={teleprompterVisible}
                onToggleTeleprompter={handleToggleTeleprompter}
                onMakeInteractive={handleMakeInteractive}
                fontSize={fontSize}
                onFontSizeChange={handleFontSizeChange}
                onMoveTeleprompter={handleMoveTeleprompter}
                shortcuts={shortcuts}
              />
            </CardContent>
          </Card>
          
          <Card className="mb-6 bg-black/40 backdrop-blur-md border-white/10 text-white shadow-lg">
            <CardHeader>
              <CardTitle>Teleprompter Text</CardTitle>
              <CardDescription className="text-white/70">
                Enter the text you want to display on the teleprompter
              </CardDescription>
            </CardHeader>
            <CardContent>
              <TeleprompterTextPanel
                teleprompterText={teleprompterText}
                onTextChange={setTeleprompterText}
                onSetText={handleSetText}
                teleprompterVisible={teleprompterVisible}
                textInputRef={textInputRef}
              />
            </CardContent>
          </Card>
      
        </>
      )}
      
      {activeTab === 'chat' && (
        <div className="h-full">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-white">Gemini Chat</h1>
            <p className="text-white/70 mt-2">
              Generate script content with Gemini AI assistant
            </p>
          </header>
          
          <Card className="bg-black/40 backdrop-blur-md border-white/10 text-white shadow-lg h-[600px]">
            <CardContent className="p-0 h-full">
              <div className="h-full border-0 rounded-md overflow-hidden">
                <GeminiChat />
              </div>
            </CardContent>
          </Card>
        </div>
      )}
      </div>
    </div>
  )
}

export default Home
