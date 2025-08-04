'use client'

import { useState, useRef, useEffect } from 'react'
import { X, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

export function TagInput({ tags = [], onChange, maxTags = 5, className = '' }) {
  const [inputValue, setInputValue] = useState('')
  const [localTags, setLocalTags] = useState(tags)
  const inputRef = useRef(null)

  useEffect(() => {
    setLocalTags(tags)
  }, [tags])

  const addTag = (tag) => {
    const trimmedTag = tag.trim()
    if (trimmedTag && !localTags.includes(trimmedTag) && localTags.length < maxTags) {
      const newTags = [...localTags, trimmedTag]
      setLocalTags(newTags)
      onChange?.(newTags)
      setInputValue('')
    }
  }

  const removeTag = (tagToRemove) => {
    const newTags = localTags.filter(tag => tag !== tagToRemove)
    setLocalTags(newTags)
    onChange?.(newTags)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      addTag(inputValue)
    } else if (e.key === 'Backspace' && inputValue === '' && localTags.length > 0) {
      removeTag(localTags[localTags.length - 1])
    }
  }

  const handleBlur = () => {
    if (inputValue.trim()) {
      addTag(inputValue)
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex flex-wrap gap-2 min-h-[40px] p-2 border rounded-md bg-background">
        {localTags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-primary/10 text-primary rounded-md"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="hover:bg-primary/20 rounded-full p-0.5"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
        {localTags.length < maxTags && (
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={handleBlur}
            placeholder={localTags.length === 0 ? "Add tags..." : ""}
            className="flex-1 min-w-[120px] border-0 p-0 focus:ring-0"
          />
        )}
      </div>
      {localTags.length >= maxTags && (
        <p className="text-xs text-muted-foreground">
          Maximum {maxTags} tags allowed
        </p>
      )}
    </div>
  )
} 