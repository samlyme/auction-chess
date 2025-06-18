// src/hooks/useChat.ts
import { useState, useEffect, useCallback, useRef } from 'react';

// Define the WebSocket server URL
const CLIENT_ID: string = Date.now().toString();
const WS_URL = `ws://localhost:8000/ws/${CLIENT_ID}`; // Adjust this to your WebSocket endpoint

interface ChatMessage {
  id: number; // Unique ID for the message (e.g., timestamp from server)
  sender: string;
  content: string;
  timestamp: string; // Formatted time string
}

interface ClientMessage {
  sender: string;
  content: string;
}

interface UseChatReturn {
  messages: ChatMessage[];
  sendMessage: (message: ClientMessage) => void;
  isConnected: boolean;
  error: string | null;
}

const useChat = (): UseChatReturn => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // useRef to hold the WebSocket instance. Specify the type of what it holds.
  const ws = useRef<WebSocket | null>(null);

  // useCallback to memoize the sendMessage function.
  const sendMessage = useCallback((message: ClientMessage) => {
    // Ensure ws.current is not null and the connection is open
    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      try {
        // Assuming your server expects a JSON string of ClientMessage
        ws.current.send(JSON.stringify(message));
      } catch (err) {
        console.error('Failed to send message:', err);
        setError('Failed to send message.');
      }
    } else {
      console.warn('WebSocket is not open. Message not sent:', message);
      setError('Connection not open to send message.');
    }
  }, []); // Empty dependency array means this function is created once

  useEffect(() => {
    // 1. Establish the WebSocket connection
    ws.current = new WebSocket(WS_URL);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      setIsConnected(true);
      setError(null); // Clear any previous errors
    };

    ws.current.onmessage = (event: MessageEvent) => {
      console.log('Received message:', event.data);
      try {
        // Assuming messages are JSON strings of ChatMessage
        const newMessage: ChatMessage = JSON.parse(event.data);
        setMessages((prevMessages) => [...prevMessages, newMessage]);
      } catch (err) {
        console.error('Failed to parse message:', event.data, err);
        setError('Failed to parse incoming message.');
      }
    };

    ws.current.onerror = (err: Event) => {
      console.error('WebSocket error:', err);
      setIsConnected(false);
      setError('WebSocket connection error.');
    };

    ws.current.onclose = (event: CloseEvent) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      setIsConnected(false);
      setError('WebSocket disconnected.');
      // Optional: Implement a reconnect strategy here if needed
    };

    // 2. Clean-up function when the component unmounts
    return () => {
      if (ws.current) {
        console.log('Closing WebSocket connection...');
        ws.current.close();
      }
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount

  return { messages, sendMessage, isConnected, error };
};

export default useChat;