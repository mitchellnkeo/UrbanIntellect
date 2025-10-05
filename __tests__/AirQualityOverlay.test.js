import { render, waitFor } from '@testing-library/react'
import { AirQualityOverlay } from '../components/AirQualityOverlay'

// Create a stable reference to the mock function
const mockHeatLayer = jest.fn(() => ({
  // Mock the return value of heatLayer, which is a layer object
  addTo: jest.fn(), 
  remove: jest.fn(), // Include remove just in case, though addTo is the primary call
}));

// Mock react-leaflet
jest.mock('react-leaflet', () => ({
  useMap: jest.fn(() => ({
    addLayer: jest.fn(),
    removeLayer: jest.fn(),
  })),
}))

// Mock dynamic imports
jest.mock('next/dynamic', () => () => {
  const DynamicComponent = () => null
  DynamicComponent.displayName = 'LoadableComponent'
  return DynamicComponent
})

// Mock leaflet
jest.mock('leaflet', () => ({
  // The component imports L = (await import('leaflet')).default;
  // So we must put heatLayer on the 'default' property.
  default: {
    heatLayer: mockHeatLayer, // <--- FIX: Ensure it's available as a function
  },
  // Also provide it directly on the module export for safety, though 'default' is primary
  heatLayer: mockHeatLayer,
}))

// Mock the imported module, even if it just registers the heatLayer on the main L object
jest.mock('leaflet.heat', () => ({}))

describe('AirQualityOverlay', () => {
  beforeEach(() => {
    // Clear the specific mock function calls before each test
    mockHeatLayer.mockClear();

    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          sensors: [
            {
              lat: 47.6062,
              lon: -122.3321,
              station_name: 'Test Station',
              air_quality: {
                overall_aqi: 50,
                category: 'Good',
                risk_level: 'Low',
                pollutants: {}
              },
              traffic_impact: 'Low',
              last_updated: '2025-01-01T00:00:00Z'
            }
          ]
        }),
      })
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  // FIX: This test ensures the asynchronous state update completes by asserting 
  // on a side effect (heatLayer creation) within waitFor, which handles the act() wrapping.
  it('fetches data on mount and updates state', async () => {
    render(<AirQualityOverlay />)
    
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith('/seattle_pscaa_air_quality_data.json')
      
      // Assert that the PSCAAHeatLayer component has run its effect 
      // and attempted to create the heat layer. This confirms state update finished.
      // We use the stable reference to the mock function here.
      expect(mockHeatLayer).toHaveBeenCalled()
    })
  })

  it('returns null while loading', () => {
    // Mock the fetch to never resolve immediately, simulating the loading state
    global.fetch = jest.fn(() => new Promise(() => {}))
    
    const { container } = render(<AirQualityOverlay />)
    expect(container.firstChild).toBeNull()
  })

  it('handles fetch errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    global.fetch = jest.fn(() => Promise.reject(new Error('Fetch failed')))
    
    render(<AirQualityOverlay />)
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        'Error loading air quality data:',
        expect.any(Error)
      )
    })
    
    consoleSpy.mockRestore()
  })

  it('handles fetch response errors', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {})
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: false,
        status: 404,
      })
    )
    
    render(<AirQualityOverlay />)
    
    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalled()
    })
    
    consoleSpy.mockRestore()
  })
})