// Date formatting utility functions for testing
function formatDate(dateString, includeTime = true) {
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

function formatDisplayDate(dateString) {
  return formatDate(dateString, false)
}

function formatDateTime(dateString) {
  return formatDate(dateString, true)
}

function isOverdue(dateString) {
  try {
    const date = new Date(dateString)
    const now = new Date()
    return date < now
  } catch (error) {
    return false
  }
}

function getRelativeTime(dateString) {
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

console.log('🔍 Testing Date Formatting\n')

// Test cases
const testDates = [
  '2025-12-12T10:30:45Z',
  '2024-01-15T14:20:30Z',
  '2023-06-08T09:15:22Z',
  '2025-03-25T16:45:10Z',
  new Date().toISOString(), // Current date
  '2024-12-31T23:59:59Z',
  '2023-02-28T12:00:00Z'
]

console.log('📅 Testing formatDisplayDate (without time):')
testDates.forEach(date => {
  console.log(`${date} → ${formatDisplayDate(date)}`)
})

console.log('\n⏰ Testing formatDateTime (with time):')
testDates.forEach(date => {
  console.log(`${date} → ${formatDateTime(date)}`)
})

console.log('\n🚨 Testing isOverdue:')
testDates.forEach(date => {
  const overdue = isOverdue(date)
  console.log(`${date} → ${overdue ? 'OVERDUE' : 'Not overdue'}`)
})

console.log('\n⏱️  Testing getRelativeTime:')
testDates.forEach(date => {
  console.log(`${date} → ${getRelativeTime(date)}`)
})

console.log('\n🎯 Expected Format Examples:')
console.log('• 12 Dec 2025 (display date)')
console.log('• 12 Dec 2025 10:30:45 (with time)')
console.log('• 15 Jan 2024 (display date)')
console.log('• 15 Jan 2024 14:20:30 (with time)')

console.log('\n✅ Date formatting test completed!')
console.log('\n📝 The dates should now display in the format "12 Dec 2025" with proper timing.') 