import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import PromptSelector from '../components/PromptSelector'

describe('PromptSelector', () => {
  beforeEach(() => {
    global.fetch = jest.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          categories: [
            {
              name: 'Housing',
              description: 'Housing development questions',
              prompts: ['Where should I build houses?']
            }
          ]
        }),
      })
    )
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('renders loading state initially', () => {
    render(<PromptSelector onPromptSelect={jest.fn()} />)
    expect(screen.getByText('Loading prompts...')).toBeInTheDocument()
  })

  it('loads and displays categories', async () => {
    render(<PromptSelector onPromptSelect={jest.fn()} />)
    
    await waitFor(() => {
      expect(screen.getByText('Housing')).toBeInTheDocument()
    })
    
    expect(screen.getByText('Housing development questions')).toBeInTheDocument()
  })

  it('calls onPromptSelect when custom prompt is submitted', async () => {
    const mockOnPromptSelect = jest.fn()
    
    render(<PromptSelector onPromptSelect={mockOnPromptSelect} />)
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/Type your own planning question/i)).toBeInTheDocument()
    })
    
    const input = screen.getByPlaceholderText(/Type your own planning question/i)
    const sendButton = screen.getByText('Send')
    
    await act(async () => {
      fireEvent.change(input, { target: { value: 'Test prompt' } })
    })
    
    await act(async () => {
      fireEvent.click(sendButton)
    })
    
    expect(mockOnPromptSelect).toHaveBeenCalledWith('Test prompt')
  })

  it('handles fetch errors gracefully', async () => {
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()
    global.fetch = jest.fn(() => Promise.reject(new Error('Fetch failed')))
    
    render(<PromptSelector onPromptSelect={jest.fn()} />)
    
    await waitFor(() => {
      expect(screen.getByText('Failed to load prompts')).toBeInTheDocument()
    })
    
    consoleSpy.mockRestore()
  })
})