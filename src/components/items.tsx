import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { VaultItem } from 'electron/preload'
import { Edit, LoaderCircle, Plus, X } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ItemWithImage extends VaultItem {
  imageUrl?: string
}

export default function Items() {
  const [items, setItems] = useState<ItemWithImage[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadItems = async () => {
      if (window.electronAPI) {
        try {
          const result = await window.electronAPI.getVaultItems()
          if (result.success) {
            // Load images for each item
            const itemsWithImages = await Promise.all(
              result.items.map(async (item) => {
                const imageResult = await window.electronAPI.getItemImage(
                  item.name,
                  item.artist
                )
                return {
                  ...item,
                  imageUrl: imageResult.success
                    ? imageResult.image || undefined
                    : undefined,
                }
              })
            )
            setItems(itemsWithImages)
          } else {
            setError(result.error || 'Failed to load items')
          }
        } catch {
          setError('Failed to load vault items')
        }
      } else {
        setError('Electron API not available')
      }
      setLoading(false)
    }

    loadItems()
  }, [])

  if (loading) {
    return (
      <div className='flex items-center justify-center p-8'>
        <LoaderCircle className='animate-spin' size={32} />
        <span className='text-muted-foreground ml-2'>
          Loading vault items...
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <div className='m-4 rounded-md border border-red-300 bg-red-50 p-4'>
        <p className='text-red-700'>Error: {error}</p>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className='m-4 py-8 text-center'>
        <p className='text-muted-foreground'>No items found in your vault</p>
      </div>
    )
  }

  return (
    <div className='grid w-full grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
      {items.map((item) => (
        <Card key={item.id} className='flex flex-col justify-between'>
          <CardHeader>
            <CardTitle>{item.name}</CardTitle>
            <CardDescription>{item.artist}</CardDescription>
            <CardAction>
              <X />
            </CardAction>
          </CardHeader>
          <CardContent className='space-y-2'>
            <p className='h-32 text-sm'>{item.description}</p>
            {item.imageUrl && (
              <div>
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className='h-64 w-full rounded-md object-cover'
                />
              </div>
            )}
          </CardContent>
          <CardFooter>
            <Button className='w-full'>
              <Edit />
              Edit
            </Button>
          </CardFooter>
        </Card>
      ))}
      <Card className='flex flex-col justify-between'>
        <CardHeader>
          <CardTitle>
            <Input placeholder='Item Name' />
          </CardTitle>
          <CardDescription>
            <Input placeholder='Item Artist' />
          </CardDescription>
          <CardAction>
            <X />
          </CardAction>
        </CardHeader>
        <CardContent className='space-y-2'>
          <Input placeholder='Item Description' className='h-32' />
          <p className='h-64'>Image upload goes here</p>
        </CardContent>
        <CardFooter>
          <Button className='w-full'>
            <Plus />
            Add
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
