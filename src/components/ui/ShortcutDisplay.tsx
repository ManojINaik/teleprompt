import React from 'react'
import { cn } from '../../utils/cn'

interface ShortcutDisplayProps {
  shortcut: string
  className?: string
}

const ShortcutDisplay: React.FC<ShortcutDisplayProps> = ({ 
  shortcut, 
  className 
}) => {
  const keys = shortcut.split('+').map(key => key.trim())
  
  return (
    <div className={cn("flex items-center gap-1", className)}>
      {keys.map((key, index) => (
        <React.Fragment key={index}>
          <span className="bg-white/20 px-1.5 py-0.5 rounded text-xs font-medium text-white">
            {key}
          </span>
          {index < keys.length - 1 && <span className="text-xs text-white/70">+</span>}
        </React.Fragment>
      ))}
    </div>
  )
}

export default ShortcutDisplay
