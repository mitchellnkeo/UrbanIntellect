import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import Home from '../pages/index'

// Mock next/head
jest.mock('next/head', () => {
  return {
    __esModule: true,
    default: ({ children }) => {
      return <>{children}</>
    },
  }
})

// Mock MUI components
jest.mock('@mui/material/Drawer', () => {
  return function MockDrawer({ children, open }) {
    return open ? <div data-testid="drawer">{children}</div> : null
  }
})

jest.mock('@mui/material/Checkbox', () => {
  return function MockCheckbox({ checked, onChange }) {
    return <input type="checkbox" checked={checked} onChange={onChange} data-testid="checkbox" />
  }
})

// Mock components
jest.mock('../components/map.js', () => {
  return function MockMap() {
    return <div data-testid="map">Map Component</div>
  }
})

jest.mock('../components/UrbanPlanningChatbox.jsx', () => {
  return function MockChatbot() {
    return <div data-testid="chatbot">Chatbot Component</div>
  }
})

jest.mock('../components/PromptSelector.jsx', () => {
  return function MockPromptSelector() {
    return <div data-testid="prompt-selector">Prompt Selector</div>
  }
})

describe('Home Page', () => {
  beforeEach(() => {
    // Suppress console.log for tests
    jest.spyOn(console, 'log').mockImplementation()
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  it('renders the main page with title', () => {
    render(<Home />)
    
    // Check for title in Head component
    const title = document.querySelector('title')
    expect(title?.textContent).toBe('Urban Intellect')
  })

  it('renders filter tabs', () => {
    render(<Home />)
    expect(screen.getByText('Filters')).toBeInTheDocument()
    expect(screen.getByText('Menu')).toBeInTheDocument()
    expect(screen.getByText('AI')).toBeInTheDocument()
  })

  it('switches between tabs', async () => {
    render(<Home />)
    
    const aiTab = screen.getByText('AI')
    fireEvent.click(aiTab)
    
    await waitFor(() => {
      expect(screen.getByTestId('prompt-selector')).toBeInTheDocument()
    })
  })

  it('displays filter checkboxes when Filters tab is active', () => {
    render(<Home />)
    
    expect(screen.getByText('Population Density')).toBeInTheDocument()
    expect(screen.getByText('AOD')).toBeInTheDocument()
    expect(screen.getByText('Air Quality')).toBeInTheDocument()
  })

  it('toggles filters when checkboxes are clicked', () => {
    render(<Home />)
    
    const checkboxes = screen.getAllByTestId('checkbox')
    expect(checkboxes).toHaveLength(3)
    
    // All should be unchecked initially
    checkboxes.forEach(checkbox => {
      expect(checkbox).not.toBeChecked()
    })
  })

  it('switches to Menu tab and shows no recommendations message', () => {
    render(<Home />)
    
    const menuTab = screen.getByText('Menu')
    fireEvent.click(menuTab)
    
    expect(screen.getByText('No recommended neighborhoods yet')).toBeInTheDocument()
  })
})