'use client'

import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { checkPasswordStrength } from '@/lib/validations'

export default function PasswordStrength({ password, showStrength = true }) {
  const [strength, setStrength] = useState({ strength: 0, message: 'Enter a password' })
  const [showRequirements, setShowRequirements] = useState(false)

  useEffect(() => {
    if (password) {
      setStrength(checkPasswordStrength(password))
      setShowRequirements(true)
    } else {
      setStrength({ strength: 0, message: 'Enter a password' })
      setShowRequirements(false)
    }
  }, [password])

  const requirements = [
    { 
      label: 'At least 8 characters', 
      met: password && password.length >= 8 
    },
    { 
      label: 'At least one uppercase letter (A-Z)', 
      met: password && /[A-Z]/.test(password) 
    },
    { 
      label: 'At least one lowercase letter (a-z)', 
      met: password && /[a-z]/.test(password) 
    },
    { 
      label: 'At least one number (0-9)', 
      met: password && /\d/.test(password) 
    },
    { 
      label: 'At least one special character (!@#$%^&*)', 
      met: password && /[!@#$%^&*(),.?":{}|<>]/.test(password) 
    }
  ]

  const getStrengthColor = (strength) => {
    switch (strength) {
      case 0:
      case 1:
        return 'bg-red-500'
      case 2:
        return 'bg-orange-500'
      case 3:
        return 'bg-yellow-500'
      case 4:
        return 'bg-blue-500'
      case 5:
        return 'bg-green-500'
      default:
        return 'bg-gray-300'
    }
  }

  const getStrengthWidth = (strength) => {
    return `${(strength / 5) * 100}%`
  }

  return (
    <div className="space-y-3">
      {/* Password Strength Bar */}
      {showStrength && password && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Password Strength
            </span>
            <span className={`text-sm font-medium ${strength.color}`}>
              {strength.message}
            </span>
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor(strength.strength)}`}
              style={{ width: getStrengthWidth(strength.strength) }}
            />
          </div>
        </div>
      )}

      {/* Password Requirements */}
      {showRequirements && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Password Requirements
            </span>
            <button
              type="button"
              onClick={() => setShowRequirements(!showRequirements)}
              className="text-xs text-blue-600 hover:text-blue-500"
            >
              {showRequirements ? 'Hide' : 'Show'}
            </button>
          </div>
          <div className="space-y-1">
            {requirements.map((requirement, index) => (
              <div key={index} className="flex items-center gap-2">
                {requirement.met ? (
                  <CheckCircle className="w-4 h-4 text-green-500" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500" />
                )}
                <span className={`text-xs ${requirement.met ? 'text-green-600' : 'text-red-600'}`}>
                  {requirement.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Password Tips */}
      {!password && (
        <div className="flex items-start gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <AlertCircle className="w-4 h-4 text-blue-500 mt-0.5 flex-shrink-0" />
          <div className="text-xs text-blue-700 dark:text-blue-300">
            <p className="font-medium mb-1">Password Requirements:</p>
            <ul className="space-y-0.5">
              <li>• At least 8 characters long</li>
              <li>• Include uppercase and lowercase letters</li>
              <li>• Include at least one number</li>
              <li>• Include at least one special character</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  )
} 