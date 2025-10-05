import Head from "next/head";
import styles from "../styles/Home.module.css";
import MapC from "../components/map.js";
import UrbanPlanningChatbot from "../components/UrbanPlanningChatbox.jsx";
import PromptSelector from "../components/PromptSelector.jsx";
import { useState } from "react";
import Drawer from '@mui/material/Drawer';
import FormGroup from '@mui/material/FormGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import axios from 'axios';

export default function Home() {
  const [focusedPointOfInterest, setFocusedPointOfInterest] = useState(null); //Now tracking focused poi by Center to push to map
  const [focusobj, setFocusObj] = useState(null)
  const [activeTab, setActiveTab] = useState("none"); // New state for tab management
  const [filters, setFilters] = useState([0, 0]);
  const [draweropen, setDrawer] = useState(false);
  
  // Hover popup state
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [popupPosition, setPopupPosition] = useState({ x: 0, y: 0 });
  
  // AI tab state
  const [showPromptSelector, setShowPromptSelector] = useState(true);
  
  // Chat state management - moved to parent to persist across tab switches
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [chatLoading, setChatLoading] = useState(false);
  const [chatConnected, setChatConnected] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState([]);
  const [pointsOfInterest, setPointsOfInterest] = useState([
  ]);

  function setFocus(id){
    let newfocus = pointsOfInterest.find(pointsOfInterest => pointsOfInterest.id === id);
    setFocusedPointOfInterest(newfocus.center);
    setFocusObj(newfocus);
    setDrawer(true);
  }

  // Handle hover events for popup
  const handlePointHover = (point, event) => {
    if (point.isAIRecommendation) {
      setHoveredPoint(point);
      setPopupPosition({
        x: event.clientX || event.pageX,
        y: event.clientY || event.pageY
      });
    }
  };

  const handlePointLeave = () => {
    setHoveredPoint(null);
  };

  // Handle prompt selection - auto-send the prompt
  const handlePromptSelect = (prompt) => {
    setChatInput(prompt);
    setShowPromptSelector(false);
    
    // Auto-send the prompt after a short delay to ensure chat is ready
    setTimeout(() => {
      // Trigger the send message function
      if (chatConnected && prompt.trim()) {
        // Create a user message
        const userMessage = {
          id: Date.now(),
          type: 'user',
          text: prompt,
          timestamp: new Date().toISOString()
        };
        
        // Add to messages
        setChatMessages(prev => [...prev, userMessage]);
        
        // Clear input
        setChatInput('');
        
        // Set loading state
        setChatLoading(true);
        
        // Send to AI (we'll need to call the AI service directly)
        sendMessageToAI(prompt);
      }
    }, 100);
  };

  // Handle switching between prompt selector and chat
  const handleShowPromptSelector = () => {
    setShowPromptSelector(true);
  };

  const handleShowChat = () => {
    setShowPromptSelector(false);
  };

  // Handle clicking on AI recommendations to zoom to them
  const handleRecommendationClick = (recommendation, index) => {
    // Find the corresponding point of interest
    const correspondingPoint = pointsOfInterest.find(point => 
      point.id === `ai-${recommendation.neighborhood_id || index}` ||
      point.isAIRecommendation
    );
    
    if (correspondingPoint) {
      // Set focus to zoom to the point
      setFocus(correspondingPoint.id);
      
      // Switch to map view (close any open tabs)
      setActiveTab("none");
    }
  };

  // Function to send message to AI service
  const sendMessageToAI = async (message) => {
    const API_BASE_URL = process.env.REACT_APP_AI_API_URL || 'http://localhost:8000';
    
    try {
      const response = await axios.post(`${API_BASE_URL}/chat`, {
        message: message
      }, { timeout: 30000 });
      
      // Create AI message
      const aiMessage = {
        id: Date.now() + 1,
        type: 'ai',
        text: response.data.response,
        intent: response.data.intent,
        confidence: response.data.confidence,
        recommendations: response.data.recommendations || [],
        timestamp: response.data.timestamp || new Date().toISOString()
      };

      // Add AI message to chat
      setChatMessages(prev => [...prev, aiMessage]);
      
      // If there are recommendations, update the map
      if (aiMessage.recommendations && aiMessage.recommendations.length > 0) {
        updatePointsOfInterestFromAI(aiMessage.recommendations);
      }
      
    } catch (error) {
      console.error('AI service error:', error);
      
      // Create error message
      const errorMessage = {
        id: Date.now() + 1,
        type: 'error',
        text: 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date().toISOString()
      };
      
      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setChatLoading(false);
    }
  };
  function setTab(tab){
    if(tab == activeTab){setActiveTab("none")}else{setActiveTab(tab)}
    console.log(filters)
  }
  function toggleFilters(filter, value){
    if(filter == 1){
      if(value){setFilters(prev => prev.map((valuech, index) => index === 0 ? 1 : valuech));}
      if(!value){setFilters(prev => prev.map((valuech, index) => index === 0 ? 0 : valuech));}
    }
    if(filter == 2){
      if(value){setFilters(prev => prev.map((valuech, index) => index === 1 ? 1 : valuech));}
      if(!value){setFilters(prev => prev.map((valuech, index) => index === 1 ? 0 : valuech));}
    }
  }

  // Function to convert AI recommendations to points of interest
  const updatePointsOfInterestFromAI = (recommendations) => {
    if (!recommendations || !Array.isArray(recommendations)) return;
    
    const aiPointsOfInterest = recommendations.map((rec, index) => ({
      id: `ai-${rec.neighborhood_id || index}`,
      center: getNeighborhoodCoordinates(rec.neighborhood_id), // We'll need to implement this
      title: `Neighborhood ${rec.neighborhood_id}`,
      description: rec.development_advice || 'AI Recommended Area',
      score: rec.score,
      density: rec.density,
      reasons: rec.reasons || [],
      isAIRecommendation: true
    }));
    
    // Replace existing points with AI recommendations
    setPointsOfInterest(aiPointsOfInterest);
    
    // Also store recommendations for Menu tab display
    setAiRecommendations(prev => [...prev, ...recommendations]);
  };

  // Function to get coordinates for a neighborhood ID
  // This would need to be implemented based on your neighborhood data structure
  const getNeighborhoodCoordinates = (neighborhoodId) => {
    // Placeholder coordinates - you'll need to map this to actual neighborhood coordinates
    // This should match the coordinate system used in your neighborhood data
    const neighborhoodCoordinates = {
      '1': [47.6, -122.3321],
      '2': [47.637, -122.3134],
      '3': [47.64, -122.37],
      '4': [47.62, -122.35],
      '5': [47.65, -122.32],
      '6': [47.58, -122.38],
      '7': [47.67, -122.29],
      '8': [47.61, -122.33],
      '9': [47.63, -122.36],
      '10': [47.59, -122.31],
      '11': [47.66, -122.34],
      '12': [47.57, -122.35],
      '13': [47.64, -122.28],
      '14': [47.62, -122.37],
      '15': [47.68, -122.31],
      '16': [47.58, -122.32],
      '17': [47.65, -122.36],
      '18': [47.61, -122.29],
      '19': [47.63, -122.33],
      '20': [47.59, -122.36]
    };
    
    return neighborhoodCoordinates[neighborhoodId] || [47.6, -122.3321]; // Default to Seattle center
  };

  return (
    <div className={styles.container}>
      <Head>
        <title>Urban Intellect</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className={styles.main}>
        {focusobj && <Drawer open={draweropen} onClose={() => {setDrawer(false)}}>
          <div className={styles.drawercontainer}> 
            <div className={styles.drawerHeader}>
              <h1>{focusobj.title}</h1>
              <button 
                className={styles.drawerCloseButton}
                onClick={() => setDrawer(false)}
                title="Close details"
              >
                ×
              </button>
            </div>
            <div className={styles.drawerBody}>
              <p>{focusobj.description}</p>
              {focusobj.isAIRecommendation && (
              <div className={styles.aiRecommendationDetails}>
                <h3>AI Analysis</h3>
                <p><strong>Score:</strong> {focusobj.score}/5</p>
                {focusobj.density && <p><strong>Population Density:</strong> {focusobj.density.toFixed(0)} people/km²</p>}
                {focusobj.reasons && focusobj.reasons.length > 0 && (
                  <div>
                    <h4>Reasons for Recommendation:</h4>
                    <ul>
                      {focusobj.reasons.map((reason, index) => (
                        <li key={index}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
              )}
            </div>
          </div>
        </Drawer>}
        <div className={styles.mapcontainer}>
          <MapC
            pointsOfInterest={pointsOfInterest}
            filters={filters}
            focusedPointOfInterest={focusedPointOfInterest}
            setFocus={setFocus}
            onPointHover={handlePointHover}
            onPointLeave={handlePointLeave}
          />
        </div>
        <div className={styles.focuscontainer}>
          <div className={styles.focusheading}>
            <button 
              className={`${styles.focusheadingtext} ${activeTab === "filters" ? styles.activeTab : ""}`}
              onClick={() => setTab("filters")}
            >
              Filters
            </button>
            <button 
              className={`${styles.focusheadingtext} ${activeTab === "menu" ? styles.activeTab : ""}`}
              onClick={() => setTab("menu")}
            >
              Menu
            </button>
            <button 
              className={`${styles.focusheadingtext} ${activeTab === "ai" ? styles.activeTab : ""}`}
              onClick={() => setTab("ai")}
            >
              AI
            </button>
          </div>
          <div className={styles.focuscontent}>
            {activeTab === "none" && (
              <>
                {pointsOfInterest.map((p) => (
                  <div
                    key={p.id}
                    className={`${styles.poiitem} ${
                      p.center === focusedPointOfInterest ? styles.focusedPoiitem : ""
                    }`}
                    onClick={() => {setFocus(p.id)}} 
                  >
                    <p>{p.title}</p>
                    <p>{p.description}</p>
                  </div>
                ))}
              </>
            )}

            {activeTab === "filters" && (
              <div className={styles.menuContent}>
                <h3>Filter Options</h3>
                  <FormGroup>
                    <FormControlLabel control={<Checkbox checked={filters[0]} onChange={(event) => {toggleFilters(1 , event.target.checked)}} />} label="Population Density" />
                    <FormControlLabel control={<Checkbox checked={filters[1]} onChange={(event) => {toggleFilters(2 , event.target.checked)}} />} label="AOD " />
  
                  </FormGroup>
              </div>
            )}

            {activeTab === "menu" && (
              <div className={styles.menuContent}>
                <h3>🤖 AI Recommendations</h3>
                {aiRecommendations.length > 0 ? (
                  <div className={styles.recommendationsList}>
                    {aiRecommendations.map((rec, index) => (
                      <div 
                        key={index} 
                        className={styles.recommendationCard}
                        onClick={() => handleRecommendationClick(rec, index)}
                      >
                        <div className={styles.recommendationHeader}>
                          <h4>📍 {rec.neighborhood || rec.name || `Recommendation ${index + 1}`} <span className={styles.clickHint}>🔍</span></h4>
                          {rec.score && (
                            <span className={styles.scoreBadge}>
                              Score: {rec.score}/5
                            </span>
                          )}
                        </div>
                        <div className={styles.recommendationContent}>
                          {rec.development_advice && (
                            <p className={styles.advice}>
                              <strong>💡 Advice:</strong> {rec.development_advice}
                            </p>
                          )}
                          {rec.density && (
                            <p className={styles.density}>
                              <strong>👥 Population Density:</strong> {rec.density.toFixed(0)} people/km²
                            </p>
                          )}
                          {rec.reasons && rec.reasons.length > 0 && (
                            <div className={styles.reasons}>
                              <strong>🎯 Why Recommended:</strong>
                              <ul>
                                {rec.reasons.map((reason, reasonIndex) => (
                                  <li key={reasonIndex}>{reason}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className={styles.noRecommendations}>
                    <p>🤖 No AI recommendations yet</p>
                    <p>Go to the AI tab and ask a question to get personalized recommendations!</p>
                  </div>
                )}
              </div>
            )}
            {activeTab === "ai" && (
              <div className={styles.aiContent}>
                {showPromptSelector ? (
                  <PromptSelector 
                    onPromptSelect={handlePromptSelect}
                    style={{ height: '100%', width: '100%' }}
                    className={styles.promptSelector}
                  />
                ) : (
                  <div className={styles.chatContainer}>
                    <div className={styles.chatHeader}>
                      <button 
                        className={styles.backToPromptsButton}
                        onClick={handleShowPromptSelector}
                      >
                        ← Browse Prompts
                      </button>
                      <button 
                        className={styles.chatButton}
                        onClick={handleShowChat}
                      >
                        💬 Chat
                      </button>
                    </div>
                    <UrbanPlanningChatbot 
                      style={{ height: 'calc(100% - 50px)', width: '100%' }}
                      className={styles.aiChatbot}
                      messages={chatMessages}
                      setMessages={setChatMessages}
                      inputMessage={chatInput}
                      setInputMessage={setChatInput}
                      isLoading={chatLoading}
                      setIsLoading={setChatLoading}
                      isConnected={chatConnected}
                      setIsConnected={setChatConnected}
                      onRecommendationsReceived={updatePointsOfInterestFromAI}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Hover Popup for AI Recommendations */}
        {hoveredPoint && (
          <div 
            className={styles.hoverPopup}
            style={{
              position: 'fixed',
              left: popupPosition.x + 10,
              top: popupPosition.y - 10,
              zIndex: 1000
            }}
          >
            <div className={styles.popupContent}>
              <div className={styles.popupHeader}>
                <h3>{hoveredPoint.title}</h3>
                <button 
                  className={styles.popupCloseButton}
                  onClick={() => setHoveredPoint(null)}
                  title="Close popup"
                >
                  ×
                </button>
              </div>
              <div className={styles.popupBody}>
                <p className={styles.popupDescription}>{hoveredPoint.description}</p>
                <div className={styles.popupDetails}>
                <p><strong>AI Score:</strong> {hoveredPoint.score}/5</p>
                {hoveredPoint.density && (
                  <p><strong>Population Density:</strong> {hoveredPoint.density.toFixed(0)} people/km²</p>
                )}
                {hoveredPoint.reasons && hoveredPoint.reasons.length > 0 && (
                  <div className={styles.popupReasons}>
                    <strong>Why Recommended:</strong>
                    <ul>
                      {hoveredPoint.reasons.slice(0, 3).map((reason, index) => (
                        <li key={index}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
