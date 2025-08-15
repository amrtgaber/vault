import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createFileRoute } from '@tanstack/react-router'
import { LoaderCircle } from 'lucide-react'
import { useEffect, useState } from 'react'

export const Route = createFileRoute('/settings')({
  component: Settings,
})

function Settings() {
  const [appVersion, setAppVersion] = useState('')

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.getAppVersion().then(setAppVersion)
    }
  }, [])

  return (
    <div className='mx-auto max-w-4xl p-6'>
      <div className='space-y-6'>
        <div className='space-y-2'>
          <h1 className='text-3xl font-bold tracking-tighter'>Settings</h1>
          <p className='text-muted-foreground'>
            Application settings and information.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Application Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div className='flex justify-between'>
              <span className='font-medium'>Version:</span>
              <span className='text-muted-foreground'>
                {appVersion || <LoaderCircle className='animate-spin' />}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
