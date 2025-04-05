import React, { useState, useRef, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';

interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

const GeminiChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'system', content: 'You are a helpful assistant for which gives 1 minute responce to given topic of my group discussion in normal indian english words and simple language.(dont ask any question give some 1minute speech on given topic)' }
  ]);
  const [input, setInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Get API key from environment
  useEffect(() => {
    const fetchApiKey = async () => {
      try {
        // Try to get from import.meta.env first (Vite)
        if (import.meta.env.VITE_GEMINI_API_KEY) {
          setApiKey(import.meta.env.VITE_GEMINI_API_KEY);
        } else {
          // Fallback - request from main process
          const key = await window.electronAPI.getEnvVar('GEMINI_API_KEY');
          if (key && key.value) {
            setApiKey(key.value);
          }
        }
      } catch (err) {
        console.error('Failed to get API key:', err);
        setError('Failed to get API key. Please check your .env file.');
      }
    };

    fetchApiKey();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!input.trim()) return;
    
    if (!apiKey) {
      setError('API key not found. Please check your .env file and ensure GEMINI_API_KEY is set.');
      return;
    }
    
    // Add user message to chat
    const userMessage: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError(null);
    
    try {
      // Use direct fetch instead of OpenAI SDK to avoid SSL issues
      const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
      const response = await fetch(`${url}?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              role: 'user', 
              parts: [{ text: input }]
            }
          ]
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`API error (${response.status}): ${errorData.error?.message || response.statusText}`);
      }
      
      const data = await response.json();
      
      // Extract response text
      const replyText = data.candidates?.[0]?.content?.parts?.[0]?.text || 'No response received';
      
      // Add assistant response to chat
      const assistantMessage: Message = {
        role: 'assistant',
        content: replyText
      };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      console.error('Error calling Gemini API:', err);
      setError(`Failed to get response from Gemini: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Handle sending a message to the teleprompter
  const sendToTeleprompter = async (text: string) => {
    try {
      await window.electronAPI.setTeleprompterText(text);
      
      // Toggle teleprompter if it's not visible
      await window.electronAPI.toggleTeleprompter();
      
      // Small notification
      const originalText = text;
      setMessages(prev => 
        prev.map(msg => 
          msg.content === originalText && msg.role === 'assistant' 
            ? { ...msg, content: originalText + "\n\n[Sent to teleprompter ]" } 
            : msg
        )
      );
    } catch (error) {
      console.error('Failed to send to teleprompter:', error);
      setError('Failed to send text to teleprompter');
    }
  };

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex flex-col h-full bg-transparent backdrop-blur-sm">
      <div className="flex-grow overflow-auto p-2">
        <div className="space-y-2">
          {messages.slice(1).map((message, index) => (
            <div
              key={index}
              className={`p-2 rounded-lg ${
                message.role === 'user' 
                  ? 'bg-blue-500 bg-opacity-70 text-white ml-auto max-w-[85%]' 
                  : 'bg-gray-700 bg-opacity-70 text-white max-w-[85%]'
              }`}
            >
              <div>{message.content}</div>
              
              {message.role === 'assistant' && !message.content.includes('[Sent to teleprompter ]') && (
                <div className="mt-2 flex justify-end">
                  <Button 
                    onClick={() => sendToTeleprompter(message.content)}
                    variant="stealthPurple"
                    size="sm"
                  >
                    Send to Teleprompter
                  </Button>
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="p-2 rounded-lg bg-gray-700 bg-opacity-70 text-white max-w-[85%]">
              <div className="animate-pulse text-white/70">Thinking...</div>
            </div>
          )}
          {error && (
            <div className="p-2 rounded-lg bg-red-500 bg-opacity-70 text-white max-w-[85%]">
              {error}
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>
      <form onSubmit={handleSubmit} className="mt-2 flex">
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={loading}
          placeholder="Ask Gemini..."
          className="flex-grow rounded-l p-2 bg-black/30 border border-white/20 text-white focus:outline-none focus:border-white/50 focus:ring-1 focus:ring-white/30"
        />
        <Button
          type="submit"
          disabled={loading || !input.trim()}
          variant="default"
          className="rounded-l-none rounded-r bg-white/10 hover:bg-white/20 text-white border-white/20"
        >
          Send
        </Button>
      </form>
    </div>
  );
};

export default GeminiChat;
