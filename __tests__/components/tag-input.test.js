import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { TagInput } from '@/components/ui/tag-input'

describe('TagInput', () => {
  const mockOnChange = jest.fn()

  beforeEach(() => {
    mockOnChange.mockClear()
  })

  it('renders with initial tags', () => {
    const initialTags = ['work', 'urgent']
    render(<TagInput tags={initialTags} onChange={mockOnChange} />)
    
    expect(screen.getByText('work')).toBeInTheDocument()
    expect(screen.getByText('urgent')).toBeInTheDocument()
  })

  it('adds a new tag when typing and pressing Enter', () => {
    render(<TagInput tags={[]} onChange={mockOnChange} />)
    
    const input = screen.getByPlaceholderText('Add tags...')
    fireEvent.change(input, { target: { value: 'new-tag' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    
    expect(mockOnChange).toHaveBeenCalledWith(['new-tag'])
  })

  it('adds a new tag when typing and pressing comma', () => {
    render(<TagInput tags={[]} onChange={mockOnChange} />)
    
    const input = screen.getByPlaceholderText('Add tags...')
    fireEvent.change(input, { target: { value: 'another-tag' } })
    fireEvent.keyDown(input, { key: ',' })
    
    expect(mockOnChange).toHaveBeenCalledWith(['another-tag'])
  })

  it('removes a tag when clicking the X button', () => {
    const initialTags = ['work', 'urgent']
    render(<TagInput tags={initialTags} onChange={mockOnChange} />)
    
    const removeButtons = screen.getAllByRole('button')
    fireEvent.click(removeButtons[0]) // Click first X button
    
    expect(mockOnChange).toHaveBeenCalledWith(['urgent'])
  })

  it('prevents adding duplicate tags', () => {
    const initialTags = ['work']
    render(<TagInput tags={initialTags} onChange={mockOnChange} />)
    
    const input = screen.getByPlaceholderText('Add tags...')
    fireEvent.change(input, { target: { value: 'work' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    
    expect(mockOnChange).not.toHaveBeenCalled()
  })

  it('respects max tags limit', () => {
    const initialTags = ['tag1', 'tag2', 'tag3', 'tag4', 'tag5']
    render(<TagInput tags={initialTags} onChange={mockOnChange} maxTags={5} />)
    
    expect(screen.queryByPlaceholderText('Add tags...')).not.toBeInTheDocument()
    expect(screen.getByText('Maximum 5 tags allowed')).toBeInTheDocument()
  })

  it('trims whitespace from tags', () => {
    render(<TagInput tags={[]} onChange={mockOnChange} />)
    
    const input = screen.getByPlaceholderText('Add tags...')
    fireEvent.change(input, { target: { value: '  spaced-tag  ' } })
    fireEvent.keyDown(input, { key: 'Enter' })
    
    expect(mockOnChange).toHaveBeenCalledWith(['spaced-tag'])
  })
}) 