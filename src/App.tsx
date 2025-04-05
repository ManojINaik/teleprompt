import React, { useEffect } from 'react'
import { Routes, Route } from 'react-router-dom'
import Home from './components/Home'
import Teleprompter from './components/Teleprompter'
import { initializeStealthMode } from './utils/stealthMode'

const App: React.FC = () => {
  // Initialize stealth mode when the app starts
  useEffect(() => {
    // Activate advanced stealth features to bypass browser tab checks
    initializeStealthMode();
    console.log('Stealth features activated');
    
    // Re-apply stealth features if focus changes
    const reapplyStealthMode = () => {
      setTimeout(() => {
        initializeStealthMode();
      }, 500);
    };
    
    // Handle visibility changes
    document.addEventListener('visibilitychange', reapplyStealthMode);
    window.addEventListener('focus', reapplyStealthMode);
    window.addEventListener('blur', reapplyStealthMode);
    
    return () => {
      document.removeEventListener('visibilitychange', reapplyStealthMode);
      window.removeEventListener('focus', reapplyStealthMode);
      window.removeEventListener('blur', reapplyStealthMode);
    };
  }, []);
  
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/teleprompter" element={<Teleprompter />} />
    </Routes>
  )
}

export default App
