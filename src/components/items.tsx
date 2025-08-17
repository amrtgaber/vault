import ItemDialog from '@/components/item-dialog'
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
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogMode, setDialogMode] = useState<'add' | 'edit'>('add')
  const [editingItem, setEditingItem] = useState<VaultItem | null>(null)

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

  const handleSaveItem = async (itemData: {
    name: string
    artist: string
    description: string
  }) => {
    if (!window.electronAPI) {
      setError('Electron API not available')
      return
    }

    try {
      if (dialogMode === 'add') {
        // Add new item
        const result = await window.electronAPI.addVaultItem(itemData)
        if (result.success && result.item) {
          // Load image for the new item
          const imageResult = await window.electronAPI.getItemImage(
            result.item.name,
            result.item.artist
          )
          const newItemWithImage = {
            ...result.item,
            imageUrl: imageResult.success ? imageResult.image || undefined : undefined,
          }
          setItems(prev => [...prev, newItemWithImage])
        } else {
          setError(result.error || 'Failed to add item')
        }
      } else if (editingItem) {
        // Update existing item
        const result = await window.electronAPI.updateVaultItem(editingItem.id, itemData)
        if (result.success && result.item) {
          // Load image for the updated item
          const imageResult = await window.electronAPI.getItemImage(
            result.item.name,
            result.item.artist
          )
          const updatedItemWithImage = {
            ...result.item,
            imageUrl: imageResult.success ? imageResult.image || undefined : undefined,
          }
          setItems(prev => 
            prev.map(item => 
              item.id === editingItem.id ? updatedItemWithImage : item
            )
          )
        } else {
          setError(result.error || 'Failed to update item')
        }
      }
    } catch (error) {
      setError('Failed to save item: ' + (error as Error).message)
    }
  }

  const handleAddClick = () => {
    setDialogMode('add')
    setEditingItem(null)
    setError(null) // Clear any previous errors
    setIsDialogOpen(true)
  }

  const handleEditClick = (item: VaultItem) => {
    setDialogMode('edit')
    setEditingItem(item)
    setError(null) // Clear any previous errors
    setIsDialogOpen(true)
  }

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
            <Button className='w-full' onClick={() => handleEditClick(item)}>
              <Edit />
              Edit
            </Button>
          </CardFooter>
        </Card>
      ))}
      <Card
        className='hover:bg-accent flex cursor-pointer items-center justify-center border-2 border-dashed transition-colors hover:border-solid'
        onClick={handleAddClick}
      >
        <div className='flex flex-col items-center justify-center p-8'>
          <Plus size={48} className='text-muted-foreground' />
          <p className='text-muted-foreground mt-2'>Add Item</p>
        </div>
      </Card>

      <ItemDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        mode={dialogMode}
        item={editingItem}
        onSave={handleSaveItem}
      />
    </div>
  )
}
