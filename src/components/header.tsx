import { Link } from '@tanstack/react-router'
import { Settings, Vault } from 'lucide-react'

export default function Header() {
  return (
    <header className='bg-primary text-primary-foreground flex h-12 items-center gap-2 px-8 transition-[width,height] ease-linear'>
      <nav className='flex w-full flex-row justify-between'>
        <Link to='/' className='flex items-center gap-2 text-xl'>
          <Vault /> Vault
        </Link>
        <Link to='/settings' className='ml-4'>
          <Settings />
        </Link>
      </nav>
    </header>
  )
}
