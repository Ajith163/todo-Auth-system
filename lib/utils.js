import { clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

// Date formatting utility function
export function formatDate(dateString, includeTime = true) {
  try {
    const date = new Date(dateString)
    
    if (isNaN(date.getTime())) {
      return 'Invalid date'
    }
    
    // Format: "12 Dec 2025"
    const day = date.getDate().toString().padStart(2, '0')
    const month = date.toLocaleDateString('en-US', { month: 'short' })
    const year = date.getFullYear()
    
    let formattedDate = `${day} ${month} ${year}`
    
    // Add time if requested
    if (includeTime) {
      const hours = date.getHours().toString().padStart(2, '0')
      const minutes = date.getMinutes().toString().padStart(2, '0')
      const seconds = date.getSeconds().toString().padStart(2, '0')
      const time = `${hours}:${minutes}:${seconds}`
      formattedDate += ` ${time}`
    }
    
    return formattedDate
  } catch (error) {
    console.error('Date formatting error:', error)
    return 'Invalid date'
  }
}

// Format date for display (without time)
export function formatDisplayDate(dateString) {
  return formatDate(dateString, false)
}

// Format date with time
export function formatDateTime(dateString) {
  return formatDate(dateString, true)
}

// Check if date is overdue
export function isOverdue(dateString) {
  try {
    const date = new Date(dateString)
    const now = new Date()
    return date < now
  } catch (error) {
    return false
  }
}

// Get relative time (e.g., "2 hours ago", "3 days ago")
export function getRelativeTime(dateString) {
  try {
    const date = new Date(dateString)
    const now = new Date()
    const diffInSeconds = Math.floor((now - date) / 1000)
    
    if (diffInSeconds < 60) {
      return `${diffInSeconds} seconds ago`
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60)
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600)
      return `${hours} hour${hours > 1 ? 's' : ''} ago`
    } else {
      const days = Math.floor(diffInSeconds / 86400)
      return `${days} day${days > 1 ? 's' : ''} ago`
    }
  } catch (error) {
    return 'Unknown time'
  }
} 