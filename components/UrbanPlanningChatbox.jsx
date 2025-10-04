import React, { useState, useEffect } from 'react';
import axios from 'axios';

const UrbanPlanningChatbot = ({ 
  className = '', 
  style = {},
  placeholder = "Ask about urban planning... (e.g., 'Where should I develop 200 houses?')",
  maxMessages = 50,
  autoScroll = true,
  showConfidence = true,
  apiUrl = null
}) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  const API_BASE_URL = apiUrl || process.env.REACT_APP_AI_API_URL || 'http://localhost:8000';

  // Check AI service connection
  useEffect(() => {
    checkConnection();
  }, []);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (autoScroll) {
      const messagesContainer = document.querySelector('.messages-container');
      if (messagesContainer) {
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
      }
    }
  }, [messages, autoScroll]);

  // Limit messages to maxMessages
  useEffect(() => {
    if (messages.length > maxMessages) {
      setMessages(prev => prev.slice(-maxMessages));
    }
  }, [messages, maxMessages]);

  const checkConnection = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/health`, { timeout: 5000 });
      setIsConnected(response.data.status === 'healthy');
    } catch (error) {
      console.error('AI connection error:', error);
      setIsConnected(false);
    }
  };

  const sendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now(),
      type: 'user',
      text: inputMessage,
      timestamp: new Date().toISOString()
    };

    setMessages(prev => [...prev, userMessage]);
    const currentMessage = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/chat`, {
        message: currentMessage
      }, { timeout: 30000 });

      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        text: response.data.response,
        intent: response.data.intent,
        confidence: response.data.confidence,
        recommendations: response.data.recommendations || [],
        timestamp: response.data.timestamp
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        text: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearHistory = async () => {
    try {
      await axios.delete(`${API_BASE_URL}/chat/history`);
      setMessages([]);
    } catch (error) {
      console.error('Clear history error:', error);
    }
  };

  const retryConnection = () => {
    checkConnection();
  };

  return (
    <div className={`urban-planning-chatbot ${className}`} style={style}>
      {/* Header */}
      <div className="chatbot-header">
        <div className="chatbot-title">
          <h3>🏙️ Urban Planning AI</h3>
          <div className={`connection-status ${isConnected ? 'connected' : 'disconnected'}`}>
            {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
          </div>
        </div>
        <div className="chatbot-actions">
          <button 
            onClick={retryConnection}
            className="retry-button"
            title="Retry Connection"
          >
            🔄
          </button>
          <button 
            onClick={clearHistory}
            className="clear-button"
            title="Clear History"
          >
            🗑️
          </button>
        </div>
      </div>

      {/* Messages */}
      <div className="messages-container">
        {messages.length === 0 && (
          <div className="welcome-message">
            <h4>Welcome to Urban Planning AI! 🎯</h4>
            <p>I can help you with:</p>
            <ul>
              <li>Development recommendations</li>
              <li>Population density analysis</li>
              <li>Location insights</li>
              <li>Neighborhood comparisons</li>
            </ul>
            <p>Try asking: "Where should I develop 200 houses?"</p>
          </div>
        )}
        
        {messages.map((message) => (
          <div key={message.id} className={`message ${message.type}`}>
            <div className="message-content">
              <p>{message.text}</p>
              {message.recommendations && message.recommendations.length > 0 && (
                <div className="recommendations">
                  <h4>📋 Recommendations:</h4>
                  {message.recommendations.map((rec, index) => (
                    <div key={index} className="recommendation-item">
                      <div className="recommendation-header">
                        <strong>Neighborhood {rec.neighborhood_id}</strong>
                        <span className="score">Score: {rec.score}/5</span>
                      </div>
                      {rec.density && (
                        <p className="density">Density: {rec.density.toFixed(0)} people/km²</p>
                      )}
                      <p className="advice">{rec.development_advice}</p>
                      {rec.reasons && rec.reasons.length > 0 && (
                        <div className="reasons">
                          <strong>Reasons:</strong>
                          <ul>
                            {rec.reasons.map((reason, i) => (
                              <li key={i}>{reason}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="message-meta">
              <span className="timestamp">
                {new Date(message.timestamp).toLocaleTimeString()}
              </span>
              {showConfidence && message.confidence && (
                <span className="confidence">
                  Confidence: {(message.confidence * 100).toFixed(0)}%
                </span>
              )}
            </div>
          </div>
        ))}
        
        {isLoading && (
          <div className="message ai">
            <div className="message-content">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="input-container">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={placeholder}
          disabled={!isConnected || isLoading}
        />
        <button 
          onClick={sendMessage} 
          disabled={!isConnected || isLoading || !inputMessage.trim()}
          className="send-button"
        >
          {isLoading ? '⏳' : '📤'}
        </button>
      </div>
    </div>
  );
};

export default UrbanPlanningChatbot;