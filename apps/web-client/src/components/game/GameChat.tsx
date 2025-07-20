import React, { useState, useEffect, useRef } from 'react';
import { Send, MessageCircle } from 'lucide-react';

interface ChatMessage {
  id: string;
  username: string;
  message: string;
  timestamp: Date;
  type: 'player' | 'system';
}

interface GameChatProps {
  tableId: string;
}

export const GameChat: React.FC<GameChatProps> = ({ tableId }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // TODO: Connect to chat WebSocket
    setIsConnected(true);
    
    // Add some mock messages
    const mockMessages: ChatMessage[] = [
      {
        id: '1',
        username: 'System',
        message: 'Welcome to the table!',
        timestamp: new Date(Date.now() - 60000),
        type: 'system'
      },
      {
        id: '2',
        username: 'Player1',
        message: 'Good luck everyone!',
        timestamp: new Date(Date.now() - 30000),
        type: 'player'
      },
      {
        id: '3',
        username: 'Player2',
        message: 'Let\'s play some poker!',
        timestamp: new Date(Date.now() - 15000),
        type: 'player'
      }
    ];
    setMessages(mockMessages);
  }, [tableId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      username: 'You',
      message: newMessage.trim(),
      timestamp: new Date(),
      type: 'player'
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');
    
    // TODO: Send message to server
    console.log('Sending message:', message);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-gray-800 p-4 border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5 text-green-400" />
          <h3 className="text-white font-semibold">Game Chat</h3>
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`}></div>
        </div>
        <p className="text-sm text-gray-400">Table #{tableId}</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex flex-col ${
              message.type === 'system' ? 'items-center' : 'items-start'
            }`}
          >
            {message.type === 'system' ? (
              <div className="bg-gray-700 text-gray-300 px-3 py-1 rounded-full text-sm">
                {message.message}
              </div>
            ) : (
              <div className="bg-gray-700 rounded-lg p-3 max-w-full">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-sm font-medium text-green-400">
                    {message.username}
                  </span>
                  <span className="text-xs text-gray-400">
                    {formatTime(message.timestamp)}
                  </span>
                </div>
                <p className="text-white text-sm break-words">
                  {message.message}
                </p>
              </div>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 border-t border-gray-700">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-gray-700 text-white px-3 py-2 rounded-lg border border-gray-600 focus:ring-2 focus:ring-poker-green focus:border-transparent"
            disabled={!isConnected}
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || !isConnected}
            className="bg-poker-green text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            title="Send message"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
}; 