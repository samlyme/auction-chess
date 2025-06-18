// src/App.tsx
import { useState, type FormEvent } from 'react'; // Import FormEvent for form submissions
import useChat from './hooks/useChat'; // Ensure correct path
import './App.css'; // Optional: for basic styling

function App() {
  const { messages, sendMessage, isConnected, error } = useChat();
  const [inputMessage, setInputMessage] = useState<string>('');
  const [username, setUsername] = useState<string>('User' + Math.floor(Math.random() * 100));

  const handleSendMessage = (e: FormEvent) => { // Type the event as FormEvent
    e.preventDefault();
    if (inputMessage.trim() && isConnected) {
      sendMessage({ // TypeScript now ensures this matches ClientMessage
        sender: username,
        content: inputMessage.trim(),
      });
      setInputMessage(''); // Clear the input field
    }
  };

  return (
    <div className="chat-container">
      <h1>Simple Chat App</h1>

      <p>Status: {isConnected ? 'Connected ✅' : 'Disconnected ❌'}</p>
      {error && <p className="error-message">Error: {error}</p>}

      <div className="username-input">
        Your Name:
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Enter your name"
          disabled={isConnected}
        />
      </div>

      <div className="messages-box">
        {messages.length === 0 && <p>No messages yet. Start chatting!</p>}
        {messages.map((msg) => (
          <div key={msg.id} className={`message ${msg.sender === username ? 'my-message' : ''}`}>
            <span className="sender">{msg.sender}</span>
            <span className="time">[{msg.timestamp}]</span>:
            <p className="content">{msg.content}</p>
          </div>
        ))}
      </div>

      <form onSubmit={handleSendMessage} className="message-form">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder="Type your message..."
          disabled={!isConnected}
        />
        <button type="submit" disabled={!isConnected || !inputMessage.trim()}>
          Send
        </button>
      </form>
    </div>
  );
}

export default App;