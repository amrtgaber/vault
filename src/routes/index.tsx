import Items from '@/components/items'
import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  component: Index,
})

function Index() {
  return (
    <div className='p-6'>
      <div className='space-y-6'>
        <header className='text-center'>
          <h1 className='text-4xl font-bold tracking-tighter'>Your Vault</h1>
        </header>
        <Items />
      </div>
    </div>
  )
}
