'use client'

import { useSession } from 'next-auth/react'
import { useState } from 'react'
import { Button } from './button'
import { Card, CardContent, CardHeader, CardTitle } from './card'

export default function SessionDebug() {
  const { data: session, status } = useSession()
  const [showDebug, setShowDebug] = useState(false)

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={() => setShowDebug(!showDebug)}
        variant="outline"
        size="sm"
        className="bg-white dark:bg-gray-800 shadow-lg"
      >
        🔍 Debug
      </Button>
      
      {showDebug && (
        <Card className="absolute bottom-12 right-0 w-96 max-h-96 overflow-auto shadow-xl">
          <CardHeader>
            <CardTitle className="text-sm">Session Debug</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-xs">
              <div>
                <strong>Status:</strong> {status}
              </div>
              <div>
                <strong>Session:</strong>
                <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-auto">
                  {JSON.stringify(session, null, 2)}
                </pre>
              </div>
              <div>
                <strong>User ID:</strong> {session?.user?.id}
              </div>
              <div>
                <strong>Email:</strong> {session?.user?.email}
              </div>
              <div>
                <strong>Role:</strong> {session?.user?.role}
              </div>
              <div>
                <strong>Approved:</strong> {session?.user?.approved?.toString()}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 