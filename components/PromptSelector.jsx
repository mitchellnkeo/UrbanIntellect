import React, { useState, useEffect } from 'react';

const PromptSelector = ({ onPromptSelect, className = '', style = {} }) => {
  const [promptData, setPromptData] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [customPrompt, setCustomPrompt] = useState('');

  // Load prompt data
  useEffect(() => {
    const loadPrompts = async () => {
      try {
        const response = await fetch('/sample_prompts.json');
        const data = await response.json();
        setPromptData(data);
        setLoading(false);
      } catch (error) {
        console.error('Failed to load prompts:', error);
        setLoading(false);
      }
    };
    loadPrompts();
  }, []);

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
  };

  const handlePromptSelect = (prompt) => {
    onPromptSelect(prompt);
    setSelectedCategory(null); // Reset to category view
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
  };

  const handleCustomPromptSubmit = () => {
    if (customPrompt.trim()) {
      onPromptSelect(customPrompt.trim());
      setCustomPrompt('');
    }
  };

  const handleCustomPromptKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleCustomPromptSubmit();
    }
  };

  if (loading) {
    return (
      <div className={`prompt-selector ${className}`} style={style}>
        <div className="loading-message">
          <p>Loading prompts...</p>
        </div>
      </div>
    );
  }

  if (!promptData) {
    return (
      <div className={`prompt-selector ${className}`} style={style}>
        <div className="error-message">
          <p>Failed to load prompts</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`prompt-selector ${className}`} style={style}>
      {!selectedCategory ? (
        // Category Selection View
        <div className="category-selection">
          <h3>Choose a Planning Category</h3>
          <p>Select a category to see related prompts, or type your own question below</p>
          
          {/* Custom Prompt Input */}
          <div className="custom-prompt-section">
            <div className="custom-prompt-input">
              <input
                type="text"
                value={customPrompt}
                onChange={(e) => setCustomPrompt(e.target.value)}
                onKeyPress={handleCustomPromptKeyPress}
                placeholder="Type your own planning question here..."
                className="custom-prompt-field"
              />
              <button
                onClick={handleCustomPromptSubmit}
                disabled={!customPrompt.trim()}
                className="custom-prompt-button"
              >
                Send
              </button>
            </div>
            <p className="custom-prompt-hint">Press Enter or click Send to use your custom prompt</p>
          </div>
          
          <div className="categories-grid">
            {promptData.categories.map((category, index) => (
              <div
                key={index}
                className="category-card"
                onClick={() => handleCategorySelect(category)}
              >
                <h4>{category.name}</h4>
                <p>{category.description}</p>
                <span className="prompt-count">
                  {category.prompts.length} prompts
                </span>
              </div>
            ))}
          </div>
        </div>
      ) : (
        // Prompt Selection View
        <div className="prompt-selection">
          <div className="prompt-header">
            <button 
              className="back-button"
              onClick={handleBackToCategories}
            >
              ← Back to Categories
            </button>
            <h3>{selectedCategory.name}</h3>
            <p>{selectedCategory.description}</p>
          </div>
          <div className="prompts-list">
            {selectedCategory.prompts.map((prompt, index) => (
              <div
                key={index}
                className="prompt-card"
                onClick={() => handlePromptSelect(prompt)}
              >
                <p>{prompt}</p>
                <span className="select-hint">Click to use this prompt</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptSelector;
