import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { VaultItem } from 'electron/preload'
import { Edit, Plus } from 'lucide-react'
import { useEffect, useState } from 'react'

interface ItemDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: 'add' | 'edit'
  item?: VaultItem | null
  onSave: (item: { name: string; artist: string; description: string }) => void
}

export default function ItemDialog({
  open,
  onOpenChange,
  mode,
  item,
  onSave,
}: ItemDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    artist: '',
    description: '',
  })

  // Reset form when dialog opens/closes or item changes
  useEffect(() => {
    if (open) {
      if (mode === 'edit' && item) {
        setFormData({
          name: item.name,
          artist: item.artist,
          description: item.description,
        })
      } else {
        setFormData({
          name: '',
          artist: '',
          description: '',
        })
      }
    }
  }, [open, mode, item])

  const handleSave = () => {
    if (!formData.name.trim() || !formData.artist.trim()) {
      return
    }

    onSave(formData)
    onOpenChange(false)
  }

  const isValid = formData.name.trim() && formData.artist.trim()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[425px]'>
        <DialogHeader>
          <DialogTitle>
            {mode === 'add' ? 'Add New Vault Item' : 'Edit Vault Item'}
          </DialogTitle>
          <DialogDescription>
            {mode === 'add'
              ? 'Enter the details for your new vault item.'
              : 'Update the details for this vault item.'}
          </DialogDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='name' className='text-right'>
              Name
            </Label>
            <Input
              id='name'
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className='col-span-3'
              placeholder='Item name'
            />
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='artist' className='text-right'>
              Artist
            </Label>
            <Input
              id='artist'
              value={formData.artist}
              onChange={(e) =>
                setFormData({ ...formData, artist: e.target.value })
              }
              className='col-span-3'
              placeholder='Artist name'
            />
          </div>
          <div className='grid grid-cols-4 items-center gap-4'>
            <Label htmlFor='description' className='text-right'>
              Description
            </Label>
            <Input
              id='description'
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className='col-span-3'
              placeholder='Item description'
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSave} disabled={!isValid}>
            {mode === 'add' ? (
              <>
                <Plus className='mr-2' size={16} />
                Add Item
              </>
            ) : (
              <>
                <Edit className='mr-2' size={16} />
                Save Changes
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}