'use client';

import { useState, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';

interface Message {
  from: string;
  to?: string;
  message: string;
  timestamp: Date;
}

interface ChatComponentProps {
  currentUser: {
    phone: string;
    name: string;
    role: string;
  };
  targetUser?: {
    phone: string;
    name: string;
  };
  onlineUsers?: string[];
}

export default function ChatComponent({ currentUser, targetUser, onlineUsers = [] }: ChatComponentProps) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [selectedContact, setSelectedContact] = useState<string>('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newSocket = io('http://localhost:8080');
    setSocket(newSocket);

    newSocket.emit('join', currentUser.phone);

    newSocket.on('connect', () => {
      setIsConnected(true);
      console.log('Connected to chat server');
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
      console.log('Disconnected from chat server');
    });

    newSocket.on('receiveMessage', (data: Message) => {
      console.log('Received message:', data);
      setMessages(prev => [...prev, {
        ...data,
        timestamp: new Date(data.timestamp)
      }]);
    });

    return () => {
      newSocket.disconnect();
    };
  }, [currentUser.phone]);

  useEffect(() => {
    if (selectedContact) {
      loadMessages();
    }
  }, [selectedContact]);

  const loadMessages = async () => {
    if (!selectedContact) return;
    
    try {
      const token = localStorage.getItem('token');
      const endpoint = currentUser.role === 'instructor' 
        ? 'http://localhost:8080/api/instructor/getMessages'
        : 'http://localhost:8080/api/student/getMessages';
        
      console.log('Loading messages between', currentUser.phone, 'and', selectedContact);
      const response = await fetch(`${endpoint}?contactPhone=${encodeURIComponent(selectedContact)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        })));
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const saveMessage = async (messageData: any) => {
    try {
      const token = localStorage.getItem('token');
      const endpoint = currentUser.role === 'instructor' 
        ? 'http://localhost:8080/api/instructor/saveMessage'
        : 'http://localhost:8080/api/student/saveMessage';
        
      await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(messageData),
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (currentUser.role === 'student' && targetUser && !selectedContact) {
      console.log('Auto-selecting instructor:', targetUser.phone);
      setSelectedContact(targetUser.phone);
    }
  }, [currentUser.role, targetUser, selectedContact]);

  const sendMessage = () => {
    if (!socket || !newMessage.trim()) return;
    
    const targetPhone = currentUser.role === 'student' && targetUser 
      ? targetUser.phone 
      : selectedContact;
      
    if (!targetPhone) return;

    const messageData = {
      from: currentUser.phone,
      to: targetPhone,
      message: newMessage.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, messageData]);
    
    saveMessage(messageData);
    socket.emit('sendMessage', messageData);
    setNewMessage('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (timestamp: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    }).format(timestamp);
  };

  return (
    <div className="chat-container">
      <div className="chat-sidebar">
        <div className="chat-header">
          <h3>
            {currentUser.role === 'instructor' ? 'Students' : 'Instructor'}
          </h3>
          <div className="flex items-center mt-2">
            <div className={`w-2 h-2 rounded-full mr-2 ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs font-semibold text-gray-800">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>

        <div className="overflow-y-auto h-full">
          {currentUser.role === 'student' && targetUser && (
            <div
              onClick={() => setSelectedContact(targetUser.phone)}
              className={`contact-item ${
                selectedContact === targetUser.phone ? 'active' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <div className="contact-name">{targetUser.name}</div>
                  <div className="contact-role">Instructor</div>
                </div>
              </div>
            </div>
          )}
          {currentUser.role === 'instructor' && onlineUsers.map((userPhone) => (
            <div
              key={userPhone}
              onClick={() => setSelectedContact(userPhone)}
              className={`contact-item ${
                selectedContact === userPhone ? 'active' : ''
              }`}
            >
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <div>
                  <div className="contact-name">Student {userPhone.slice(-4)}</div>
                  <div className="contact-role">
                    <span className="w-2 h-2 bg-green-500 rounded-full inline-block mr-1"></span>
                    Online
                  </div>
                </div>
              </div>
            </div>
          ))}
          {currentUser.role === 'instructor' && onlineUsers.length === 0 && (
            <div className="p-4 text-center">
              <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z" />
              </svg>
              <p className="text-sm font-semibold text-gray-700">No students online</p>
            </div>
          )}
        </div>
      </div>
      <div className="chat-main">
        {selectedContact ? (
          <>
            <div className="chat-header">
              <h4>
                {currentUser.role === 'instructor' 
                  ? `Student ${selectedContact.slice(-4)}`
                  : targetUser?.name || 'Instructor'
                }
              </h4>
              <p className="text-sm font-semibold text-gray-800">
                <span className="w-2 h-2 bg-green-500 rounded-full inline-block mr-1"></span>
                Active now
              </p>
            </div>
            <div className="messages-container">
              {messages.filter(msg => {
                if (currentUser.role === 'student' && targetUser) {
                  return (msg.from === currentUser.phone && msg.to === targetUser.phone) ||
                         (msg.from === targetUser.phone && msg.to === currentUser.phone);
                }
                if (currentUser.role === 'instructor' && selectedContact) {
                  return (msg.from === currentUser.phone && msg.to === selectedContact) ||
                         (msg.from === selectedContact && msg.to === currentUser.phone);
                }
                return false;
              }).map((message, index) => (
                <div
                  key={index}
                  className={`message ${message.from === currentUser.phone ? 'own' : ''}`}
                >
                  <div className="message-bubble">
                    <p>{message.message}</p>
                    <div className="message-time">
                      {formatTime(message.timestamp)}
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
              {messages.length === 0 && (
                <div className="chat-empty">
                  <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <p className="font-semibold text-gray-700">Start a conversation...</p>
                </div>
              )}
            </div>
            <div className="message-input-container">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type a message..."
                className="message-input"
                disabled={!isConnected}
              />
              <button
                onClick={sendMessage}
                disabled={!newMessage.trim() || !isConnected}
                className="send-button"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
              {!isConnected && (
                <p className="text-xs text-red-500 mt-1">Connection lost. Trying to reconnect...</p>
              )}
            </div>
          </>
        ) : (
          <div className="no-contact-selected">
            <div className="text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <h3 className="text-lg font-bold text-gray-900 mb-2">Start a conversation</h3>
              <p className="text-gray-700 font-semibold">
                {currentUser.role === 'instructor' 
                  ? 'Select a student to start chatting'
                  : 'Click on instructor to start chatting'
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
