import React from 'react'
import { Button } from './ui/button'
import ShortcutDisplay from './ui/ShortcutDisplay'

interface TeleprompterControlsProps {
  teleprompterVisible: boolean
  onToggleTeleprompter: () => void
  onMakeInteractive: (interactive: boolean) => void
  fontSize: number
  onFontSizeChange: (size: number) => void
  onMoveTeleprompter: (direction: 'left' | 'right' | 'up' | 'down') => void
  shortcuts: Record<string, string>
}

const TeleprompterControls: React.FC<TeleprompterControlsProps> = ({
  teleprompterVisible,
  onToggleTeleprompter,
  onMakeInteractive,
  fontSize,
  onFontSizeChange,
  onMoveTeleprompter,
  shortcuts
}) => {
  return (
    <div className="space-y-4">
      <div className="mb-4 flex items-center">
        <Button
          onClick={onToggleTeleprompter}
          variant={teleprompterVisible ? 'destructive' : 'default'}
          className="mr-2 bg-white/10 hover:bg-white/20 text-white border-white/20"
        >
          {teleprompterVisible ? 'Hide Teleprompter' : 'Show Teleprompter'}
        </Button>
        <span className="text-sm text-white/70 ml-2">
          Shortcut: <ShortcutDisplay shortcut={shortcuts.toggleTeleprompter} />
        </span>
      </div>

      {teleprompterVisible && (
        <>
          <div className="mb-4 flex items-center space-x-4">
            <Button
              onClick={() => onMakeInteractive(true)}
              variant="secondary"
              className="bg-white/10 hover:bg-white/20 text-white border-white/20"
            >
              Make Interactive
            </Button>
            <span className="text-sm text-gray-500">
              Shortcut: <ShortcutDisplay shortcut={shortcuts.makeInteractive} />
            </span>
            
            <Button
              onClick={() => onMakeInteractive(false)}
              variant="outline"
              className="bg-black/40 hover:bg-white/20 text-white border-white/20"
            >
              Go Stealth
            </Button>
            <span className="text-sm text-gray-500">
              Shortcut: <ShortcutDisplay shortcut={shortcuts.makeNonInteractive} />
            </span>
          </div>
          
          <div className="mb-4">
            <div className="text-sm font-medium mb-2 text-white">Font Size: {fontSize}px</div>
            <div className="flex items-center space-x-4">
              <Button
                onClick={() => onFontSizeChange(Math.max(fontSize - 2, 12))}
                variant="outline"
                className="px-3 bg-black/40 hover:bg-white/20 text-white border-white/20"
              >
                Smaller (A-)
              </Button>
              <span className="text-sm text-gray-500">
                Shortcut: <ShortcutDisplay shortcut={shortcuts.decreaseFontSize} />
              </span>
              
              <Button
                onClick={() => onFontSizeChange(Math.min(fontSize + 2, 72))}
                variant="outline"
                className="px-3 bg-black/40 hover:bg-white/20 text-white border-white/20"
              >
                Larger (A+)
              </Button>
              <span className="text-sm text-gray-500">
                Shortcut: <ShortcutDisplay shortcut={shortcuts.increaseFontSize} />
              </span>
            </div>
          </div>
          
          <div className="mb-4">
            <div className="text-sm font-medium mb-2 text-white">Position Control</div>
            <div className="grid grid-cols-3 gap-2 w-fit">
              <div></div>
              <Button
                onClick={() => onMoveTeleprompter('up')}
                variant="secondary"
                className="px-3 py-1 h-auto bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                ↑
              </Button>
              <div></div>
              <Button
                onClick={() => onMoveTeleprompter('left')}
                variant="secondary"
                className="px-3 py-1 h-auto bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                ←
              </Button>
              <div></div>
              <Button
                onClick={() => onMoveTeleprompter('right')}
                variant="secondary"
                className="px-3 py-1 h-auto bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                →
              </Button>
              <div></div>
              <Button
                onClick={() => onMoveTeleprompter('down')}
                variant="secondary"
                className="px-3 py-1 h-auto bg-white/10 hover:bg-white/20 text-white border-white/20"
              >
                ↓
              </Button>
              <div></div>
            </div>
            <div className="mt-2 text-xs text-white/70">
              Shortcut: Ctrl + Arrow Keys
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default TeleprompterControls
