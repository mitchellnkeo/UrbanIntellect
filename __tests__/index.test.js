import { render, screen, fireEvent } from '@testing-library/react'
import Home from '../pages/index'

// Mock the Map component and its sub-components to prevent Leaflet errors in the test environment
jest.mock('../components/map.js', () => {
  const MapC = ({ setHoveredPoint, setPopupPosition, setFilters, setPointsOfInterest, filters, pointsOfInterest, activeTab, hoveredPoint, setFocusObj, focusObj, aiRecommendations, setAiRecommendations, handleResetAIRecommendations, setActiveTab }) => (
    <div data-testid="map">
      {/* Simulate map interaction elements needed for testing */}
      Map Component
    </div>
  )
  MapC.displayName = 'MapC'
  return MapC
})

// Mock the PromptSelector
jest.mock('../components/PromptSelector.jsx', () => {
  const PromptSelector = () => <div data-testid="prompt-selector">Prompt Selector</div>
  PromptSelector.displayName = 'PromptSelector'
  return PromptSelector
})

// Mock the UrbanPlanningChatbot
jest.mock('../components/UrbanPlanningChatbox.jsx', () => {
  const UrbanPlanningChatbot = () => <div>Urban Planning Chatbot</div>
  UrbanPlanningChatbot.displayName = 'UrbanPlanningChatbot'
  return UrbanPlanningChatbot
})

// Mock MUI Drawer/FormGroup/FormControlLabel/Checkbox/axios using simple divs for test rendering
jest.mock('@mui/material/Drawer', () => (props) => <div data-testid="drawer">{props.children}</div>)
jest.mock('@mui/material/FormGroup', () => (props) => <div>{props.children}</div>)
jest.mock('@mui/material/FormControlLabel', () => (props) => <div>{props.children}</div>)
// Mock Checkbox as a simple input to make testing library find the checkable item
jest.mock('@mui/material/Checkbox', () => (props) => <input data-testid="checkbox" type="checkbox" checked={props.checked} onChange={props.onChange} aria-label={props['aria-label']} />)
jest.mock('axios', () => ({
  get: jest.fn(() => Promise.resolve({ data: {} })),
}))


describe('Home Page', () => {
  // Test Case 1: Renders the main structure and corrected filter tabs
  it('renders filter tabs', () => {
    render(<Home />)
    expect(screen.getByText('Filters')).toBeInTheDocument()
    expect(screen.getByText('POIs')).toBeInTheDocument()
    expect(screen.getByText('AI')).toBeInTheDocument()
  })

  // Test Case 2: Renders all filter options
  it('renders all filter options', () => {
    render(<Home />)
    expect(screen.getByText('Filter Options')).toBeInTheDocument()
    expect(screen.getByText('Population Density')).toBeInTheDocument()
    expect(screen.getByText('Air Quality')).toBeInTheDocument()
    expect(screen.getByText('Water Quality')).toBeInTheDocument()
    expect(screen.getByText('Public Transportation')).toBeInTheDocument()
    expect(screen.getByText('Flood Risk')).toBeInTheDocument()

    // Confirms all 5 filter options are present
    expect(screen.queryAllByTestId('checkbox').length).toBe(5)
  })

  // Test Case 3: Switches to AI tab and shows Prompt Selector, then POIs tab and shows 'No recommended' message
  it('switches to AI tab and shows prompt selector, then POIs tab and shows no recommendations message', () => {
    render(<Home />)

    // Switch to AI tab
    const aiTab = screen.getByText('AI')
    fireEvent.click(aiTab)

    // Assert AI content is displayed (Prompt Selector is the initial view when no recommendations exist)
    expect(screen.getByText('Prompt Selector')).toBeInTheDocument()

    // Switch to POIs tab
    const poisTab = screen.getByText('POIs')
    fireEvent.click(poisTab)

    // Assert POIs content is displayed (No recommended neighborhoods message when state is empty)
    expect(screen.getByText('Recommended Neighborhoods')).toBeInTheDocument()
    expect(screen.getByText('No recommended neighborhoods yet')).toBeInTheDocument()
  })

  // Test Case 4: Toggles a filter and verifies its state (Refactored for best practice)
  it('toggles a filter checkbox correctly', () => {
    render(<Home />)
    
    // Find the accessible input element associated with the label text
    const densityCheckboxInput = screen.getByLabelText('Population Density')

    // Initially unchecked (filters[0] is 0)
    expect(densityCheckboxInput.checked).toBe(false)
    
    // Click the input element to toggle it (simulating user interaction with the control)
    fireEvent.click(densityCheckboxInput)
    
    // Check if the state (checked status) has updated to true
    expect(densityCheckboxInput.checked).toBe(true)
    
    // Click again to untoggle
    fireEvent.click(densityCheckboxInput)
    
    // Check if the state has reverted to false
    expect(densityCheckboxInput.checked).toBe(false)
  })
})
