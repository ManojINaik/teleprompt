import React from 'react'
import { Button } from './ui/button'

interface TeleprompterTextPanelProps {
  teleprompterText: string
  onTextChange: (text: string) => void
  onSetText: () => void
  teleprompterVisible: boolean
}

const TeleprompterTextPanel: React.FC<TeleprompterTextPanelProps> = ({
  teleprompterText,
  onTextChange,
  onSetText,
  teleprompterVisible
}) => {
  return (
    <div className="space-y-4">
      <textarea
        value={teleprompterText}
        onChange={(e) => onTextChange(e.target.value)}
        className="w-full min-h-[200px] p-3 border rounded-md bg-black/20 text-white border-white/20 focus:border-white/40 focus:outline-none focus:ring-1 focus:ring-white/40"
        placeholder="Enter your script here..."
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
        Tip: Use the interactive mode to paste text directly into the teleprompter window
      </div>
    </div>
  )
}

export default TeleprompterTextPanel
