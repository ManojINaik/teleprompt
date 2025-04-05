/**
 * Advanced Stealth Mode Utilities
 * 
 * These functions help bypass browser tab and focus detection mechanisms
 * that would normally prevent a window from displaying content when not in focus
 * or during screen sharing sessions.
 */

/**
 * Initializes all stealth mode features for the application
 * Exact implementation matching interview-coder-no-sub project
 */
export function initializeStealthMode() {
  // Apply stealth mode class to body
  document.body.classList.add('stealth-mode');
  
  // Initialize all bypass techniques
  preventVisibilityDetection();
  preventFocusDetection();
  bypassScreenSharingDetection();
  preventTabSwitchEffects();
  
  // Set up advanced listeners
  setupAdvancedKeepAliveListeners();
  
  // Add periodic reactivation to ensure stealth stays active, but at a reasonable interval
  // to avoid excessive logging and performance issues
  setInterval(() => {
    // Only reapply if document is hidden or not focused - reduces console spam
    if (document.visibilityState === 'hidden' || !document.hasFocus()) {
      preventVisibilityDetection();
      preventFocusDetection();
      bypassScreenSharingDetection();
    }
  }, 1000); // Changed from 250ms to 1000ms to reduce frequency
  
  console.log('Stealth mode activated with all bypass features');
}

/**
 * Prevents browser from detecting tab/window visibility changes
 */
function preventVisibilityDetection() {
  // Only implement if not already overridden - prevents excessive logging
  if (document.visibilityState === 'hidden') {
    // Override the visibilitychange event
    // Always report the page as visible
    try {
      Object.defineProperty(Document.prototype, 'visibilityState', {
        get: function() {
          return 'visible';
        }
      });
      
      // Override hidden property
      Object.defineProperty(Document.prototype, 'hidden', {
        get: function() {
          return false;
        }
      });
      
      // Prevent visibility change events
      document.addEventListener('visibilitychange', function(e) {
        e.stopImmediatePropagation();
      }, true);
      
      console.log('Visibility detection bypass activated');
    } catch (e) {
      // Property may already be defined and not configurable
      console.warn('Unable to override visibility detection', e);
    }
  }
}

/**
 * Prevents focus/blur detection that can affect the application when
 * the user switches to a different window
 * Exact implementation matching interview-coder-no-sub project
 */
function preventFocusDetection() {
  // Intercept and cancel all blur events
  window.addEventListener('blur', function(e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    window.focus();
    return false;
  }, true);
  
  // Let focus events pass through but still maintain our overrides
  window.addEventListener('focus', function() {
    setTimeout(() => {
      document.hasFocus = function() { return true; };
    }, 10);
  }, false);
  
  // Insert hidden iframe to maintain focus - only if not already present
  if (!document.querySelector('iframe[title="focus-keeper"]')) {
    try {
      const keepFocusFrame = document.createElement('iframe');
      keepFocusFrame.style.position = 'absolute';
      keepFocusFrame.style.top = '-1000px';
      keepFocusFrame.style.left = '-1000px';
      keepFocusFrame.style.width = '1px';
      keepFocusFrame.style.height = '1px';
      keepFocusFrame.style.opacity = '0';
      keepFocusFrame.style.pointerEvents = 'none';
      keepFocusFrame.title = 'focus-keeper';
      keepFocusFrame.tabIndex = -1;
      document.body.appendChild(keepFocusFrame);
    } catch (e) {
      console.error('Error creating focus keeper iframe', e);
    }
  }
  
  // Only log once
  if (!window._focusDetectionBypassLogged) {
    console.log('Focus detection bypass activated');
    window._focusDetectionBypassLogged = true;
  }
}

/**
 * Applies advanced techniques to prevent screen sharing tools from detecting
 * that the teleprompter is present
 * Exact implementation matching interview-coder-no-sub project
 */
function bypassScreenSharingDetection() {
  // Create multiple hidden canvas elements for screen capturing bypass
  // Only create if not already present - prevents excessive DOM manipulation
  if (!document.querySelector('canvas[aria-hidden="true"]')) {
    createHiddenCanvas();
  }
  
  // Apply specific properties to disable common capture methods
  document.documentElement.classList.add('capture-bypass');
  
  try {
    // Force hardware acceleration to prevent certain capture methods
    document.body.style.transform = 'translateZ(0)';
    document.body.style.backfaceVisibility = 'hidden';
    
    // Apply blend mode that can interfere with some capture methods
    document.body.style.isolation = 'isolate';
    
    // Specialized canvas pattern to interfere with certain capture algorithms
    const ctx = createHiddenCanvas().getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgba(0,0,0,0.001)';
      ctx.fillRect(0, 0, 2, 2);
    }

    // Apply CSS that simulates electron window properties - only if not already present
    if (!document.querySelector('style#stealth-styles')) {
      const style = document.createElement('style');
      style.id = 'stealth-styles';
      style.innerHTML = `
        body.stealth-mode {
          background-color: rgba(0,0,0,0) !important;
          -webkit-app-region: drag;
        }
        body.stealth-mode * {
          background-clip: padding-box !important;
        }
        .capture-bypass {
          mix-blend-mode: normal !important;
          isolation: isolate !important;
        }
      `;
      document.head.appendChild(style);
    }
  } catch (e) {
    console.error('Error setting up screen sharing bypass', e);
  }
  
  // Only log once
  if (!window._screenSharingBypassLogged) {
    console.log('Screen sharing bypass activated');
    window._screenSharingBypassLogged = true;
  }
}

/**
 * Creates a hidden canvas element with specific properties
 * to help bypass screen recording detection
 */
function createHiddenCanvas() {
  const canvas = document.createElement('canvas');
  canvas.width = 2;
  canvas.height = 2;
  canvas.style.position = 'fixed';
  canvas.style.top = '-10000px';
  canvas.style.left = '-10000px';
  canvas.style.opacity = '0.01';
  canvas.style.pointerEvents = 'none';
  canvas.setAttribute('aria-hidden', 'true');
  document.body.appendChild(canvas);
  return canvas;
}

/**
 * Prevents negative effects when tab switching occurs
 * Exact implementation matching interview-coder-no-sub project
 */
function preventTabSwitchEffects() {
  // Override requestAnimationFrame to keep running animations when tab is inactive
  const originalRequestAnimationFrame = window.requestAnimationFrame;
  window.requestAnimationFrame = function(callback) {
    return originalRequestAnimationFrame.call(window, callback);
  };
  
  // Override performance timing API - with proper error handling
  if (window.performance && window.performance.timing) {
    try {
      // Use proper error handling with configurable check
      const timingDescriptor = Object.getOwnPropertyDescriptor(window.performance, 'timing');
      if (timingDescriptor && timingDescriptor.configurable) {
        const originalTiming = window.performance.timing;
        
        // Create a proxy for the timing object
        const timingProxy = new Proxy(originalTiming, {
          get: function(target, prop) {
            if (prop === 'navigationStart') {
              return Date.now() - 1000; // Always appear as if loaded recently
            }
            return target[prop];
          }
        });
        
        Object.defineProperty(window.performance, 'timing', {
          get: function() {
            return timingProxy;
          },
          configurable: true
        });
      }
    } catch (e) {
      console.warn('Unable to override performance timing', e);
    }
  }
  
  // Only log once to reduce console spam
  if (!window._tabSwitchEffectsPreventionLogged) {
    console.log('Tab switch effects prevention activated');
    window._tabSwitchEffectsPreventionLogged = true;
  }
}

/**
 * Sets up advanced listeners to keep the application active
 * Exact implementation matching interview-coder-no-sub project
 */
function setupAdvancedKeepAliveListeners() {
  // Re-apply our overrides when tab gets actual focus (after being truly blurred)
  document.addEventListener('visibilitychange', function() {
    setTimeout(() => {
      preventVisibilityDetection();
      preventFocusDetection();
    }, 0);
  }, false);
  
  // Reapply before possible tab switching
  document.addEventListener('mouseout', function(e) {
    if (e.relatedTarget === null) {
      preventVisibilityDetection();
      preventFocusDetection();
    }
  }, false);
  
  // Reapply after alt+tab
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Alt' || e.key === 'Tab' || e.key === 'Meta' || e.key === 'Win') {
      setTimeout(() => {
        preventVisibilityDetection();
        preventFocusDetection();
      }, 0);
    }
  }, false);

  // Simulate Electron's setContentProtection in web environment
  simulateContentProtection();
  
  // Additional techniques to bypass tab checks and screen sharing detection
  keepAnimationsRunning();
  preventPageFreeze();
  
  console.log('Advanced keep-alive listeners activated');
}

/**
 * Simulates Electron's setContentProtection feature in a web browser
 * Inspired by the Electron features in interview-coder-no-sub
 */
function simulateContentProtection() {
  // Override the window.matchMedia method to prevent detection of screen sharing
  try {
    const originalMatchMedia = window.matchMedia;
    window.matchMedia = function(query) {
      // Special handling for screen capture detection media queries
      if (query.includes('display-mode') || query.includes('screen')) {
        return {
          matches: false,
          media: query,
          onchange: null,
          addListener: function() {},
          removeListener: function() {},
          addEventListener: function() {},
          removeEventListener: function() {},
          dispatchEvent: function() { return true; }
        };
      }
      // Otherwise use original implementation
      return originalMatchMedia.call(window, query);
    };
  } catch (e) {
    console.warn('Failed to override matchMedia', e);
  }

  // Add CSS to help with content protection - only if not already present
  if (!document.querySelector('style#content-protection-styles')) {
    const style = document.createElement('style');
    style.id = 'content-protection-styles';
    style.textContent = `
      /* Attempt to prevent screen capture by using special styles */
      body.stealth-mode {
        -webkit-backdrop-filter: none !important;
        backdrop-filter: none !important;
      }
      
      /* Make elements harder to capture in certain screen recording software */
      body.stealth-mode .capture-sensitive {
        transform: translateZ(0);
        backface-visibility: hidden;
        perspective: 1000px;
        will-change: transform, opacity;
      }
    `;
    document.head.appendChild(style);
  }
  
  // Only log once to prevent console spam
  if (!window._contentProtectionLogged) {
    console.log('Content protection simulation activated');
    window._contentProtectionLogged = true;
  }
}

/**
 * Keeps animations running even when the tab is not active
 * Similar to Electron's alwaysOnTop and other window features
 * Uses a CSP-compliant approach without Web Workers
 */
function keepAnimationsRunning() {
  // Create a hidden iframe that will keep running even when tab is inactive
  // Only create if not already present
  if (!document.querySelector('iframe[title="timer-keeper"]')) {
    try {
      const timerFrame = document.createElement('iframe');
      timerFrame.style.position = 'absolute';
      timerFrame.style.width = '1px';
      timerFrame.style.height = '1px';
      timerFrame.style.opacity = '0';
      timerFrame.style.pointerEvents = 'none';
      timerFrame.style.top = '-1000px';
      timerFrame.style.left = '-1000px';
      timerFrame.title = 'timer-keeper';
      timerFrame.setAttribute('aria-hidden', 'true');
      document.body.appendChild(timerFrame);
      
      // Keep track of active animations and ensure they continue
      const frameWindow = timerFrame.contentWindow;
      if (frameWindow && frameWindow.document) {
        // Set up continuous animation loop in the iframe
        const script = document.createElement('script');
        script.textContent = `
          (function() {
            // Create a continuous animation loop
            let lastTime = Date.now();
            
            function triggerAnimations() {
              const now = Date.now();
              const delta = now - lastTime;
              lastTime = now;
              
              // Post message to parent if we detect inactivity
              if (delta > 200) {
                window.parent.postMessage('reactivate', '*');
              }
              
              // Continue the loop
              window.requestAnimationFrame(triggerAnimations);
            }
            
            // Start the loop
            window.requestAnimationFrame(triggerAnimations);
            
            // Listen for parent page messages
            window.addEventListener('message', function(e) {
              if (e.data === 'ping') {
                lastTime = Date.now();
              }
            });
          })();
        `;
        
        frameWindow.document.body.appendChild(script);
        
        // Set up message handler from iframe
        window.addEventListener('message', function(e) {
          if (e.data === 'reactivate') {
            preventVisibilityDetection();
            preventFocusDetection();
            preventTabSwitchEffects();
          }
        });
        
        // Ping the iframe regularly
        setInterval(() => {
          frameWindow.postMessage('ping', '*');
        }, 500);
      }
    } catch (e) {
      console.error('Failed to create timer frame', e);
    }
  }
  
  // Only log once to prevent console spam
  if (!window._keepAnimationsRunningLogged) {
    console.log('Keep animations running mechanism activated');
    window._keepAnimationsRunningLogged = true;
  }
}

/**
 * Prevents the page from freezing when in background
 * Simulates Electron's behavior where windows don't freeze
 */
function preventPageFreeze() {
  // Create a persistent audio context to prevent page freezing
  // This is a technique used by video conferencing apps
  if (!window._audioContextCreated) {
    try {
      // @ts-ignore - WebKit prefix is still needed for some browsers
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      
      if (AudioContextClass) {
        const audioContext = new AudioContextClass();
        const silentOscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        // Set the volume to effectively zero but not actually zero
        // to keep the audio context active
        gainNode.gain.value = 0.001;
        
        silentOscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        silentOscillator.start();
        
        // Set audio context to keep running in background
        if (audioContext.resume) {
          // Keep it running
          setInterval(() => {
            if (audioContext.state !== 'running') {
              audioContext.resume().catch(e => {
                console.warn('Failed to resume audio context', e);
              });
            }
          }, 1000);
        }
        
        window._audioContextCreated = true;
      }
    } catch (e) {
      console.warn('Failed to create audio keep-alive', e);
    }
  }
  
  // Only set up visibilitychange listener once
  if (!window._pageFreezePreventerAdded) {
    // Use the Page Visibility API to prevent freezing
    document.addEventListener('visibilitychange', function() {
      if (document.visibilityState === 'hidden') {
        // Schedule regular tasks to prevent complete freezing
        const preventFreezeInterval = setInterval(function() {
          // Force minimal CPU activity to prevent complete suspension
          const now = Date.now();
          // Just enough computation to keep things alive without excessive logging
          for (let i = 0; i < 10000; i++) {
            if (i === 9999) {
              // Reduce volume of log messages
              if (!window._lastKeepAliveTick || now - window._lastKeepAliveTick > 10000) {
                console.debug('Keep-alive tick:', now);
                window._lastKeepAliveTick = now;
              }
            }
          }
        }, 2000);
        
        // Clean up the interval when page becomes visible again
        document.addEventListener('visibilitychange', function cleanUp() {
          if (document.visibilityState === 'visible') {
            clearInterval(preventFreezeInterval);
            document.removeEventListener('visibilitychange', cleanUp);
          }
        });
      }
    });
    
    window._pageFreezePreventerAdded = true;
  }
  
  // Only log once to prevent console spam
  if (!window._pageFreezePreventerLogged) {
    console.log('Page freeze prevention activated');
    window._pageFreezePreventerLogged = true;
  }
}

// Add these missing type declarations for our custom properties
declare global {
  interface Window {
    _focusDetectionBypassLogged?: boolean;
    _screenSharingBypassLogged?: boolean;
    _tabSwitchEffectsPreventionLogged?: boolean;
    _contentProtectionLogged?: boolean;
    _keepAnimationsRunningLogged?: boolean;
    _pageFreezePreventerLogged?: boolean;
    _audioContextCreated?: boolean;
    _pageFreezePreventerAdded?: boolean;
    _lastKeepAliveTick?: number;
  }
}

// Export more specific functions for targeted use
export const stealthUtils = {
  initializeStealthMode,
  preventVisibilityDetection,
  preventFocusDetection,
  bypassScreenSharingDetection,
  simulateContentProtection,
  keepAnimationsRunning,
  preventPageFreeze
};
