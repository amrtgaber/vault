import { app, BrowserWindow, ipcMain } from 'electron'
import { VaultItem } from 'electron/preload'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))

const isDev = process.env.NODE_ENV === 'development'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  })

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173')
    mainWindow.webContents.openDevTools()
  } else {
    mainWindow.loadFile(join(__dirname, '../dist/index.html'))
  }
}

app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

// Example IPC handlers for Node.js functionality
ipcMain.handle('get-app-version', () => {
  return app.getVersion()
})

ipcMain.handle('read-file', async (_, filePath: string) => {
  const fs = await import('fs/promises')
  try {
    const content = await fs.readFile(filePath, 'utf-8')
    return { success: true, content }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('write-file', async (_, filePath: string, content: string) => {
  const fs = await import('fs/promises')
  try {
    await fs.writeFile(filePath, content, 'utf-8')
    return { success: true }
  } catch (error) {
    return { success: false, error: (error as Error).message }
  }
})

ipcMain.handle('get-vault-items', async () => {
  const fs = await import('fs/promises')
  const path = await import('path')
  try {
    const appPath = app.getAppPath()
    const itemsPath = isDev
      ? path.join(appPath, 'vault-items.json')
      : path.join(path.dirname(app.getPath('exe')), 'data/vault-items.json')

    let content: string
    try {
      content = await fs.readFile(itemsPath, 'utf-8')
    } catch {
      // File doesn't exist, create empty vault file
      const emptyVault = { items: [] }
      const emptyContent = JSON.stringify(emptyVault, null, 2)

      // Ensure directory exists
      await fs.mkdir(path.dirname(itemsPath), { recursive: true })
      await fs.writeFile(itemsPath, emptyContent, 'utf-8')

      content = emptyContent
    }

    const data = JSON.parse(content)
    return { success: true, items: data.items }
  } catch (error) {
    return { success: false, error: (error as Error).message, items: [] }
  }
})

ipcMain.handle(
  'add-vault-item',
  async (
    _,
    itemData: { name: string; artist: string; description: string }
  ) => {
    const fs = await import('fs/promises')
    const path = await import('path')
    try {
      const appPath = app.getAppPath()
      const itemsPath = isDev
        ? path.join(appPath, 'vault-items.json')
        : path.join(path.dirname(app.getPath('exe')), 'data/vault-items.json')

      // Read current data
      let content: string
      try {
        content = await fs.readFile(itemsPath, 'utf-8')
      } catch {
        // File doesn't exist, create empty vault
        const emptyVault = { items: [] }
        content = JSON.stringify(emptyVault, null, 2)
        await fs.mkdir(path.dirname(itemsPath), { recursive: true })
      }

      const data = JSON.parse(content)

      // Generate new ID (simple incrementing ID)
      const maxId =
        data.items.length > 0
          ? Math.max(...data.items.map((item: VaultItem) => item.id))
          : 0
      const newItem = {
        id: maxId + 1,
        ...itemData,
      }

      // Add new item
      data.items.push(newItem)

      // Write back to file
      await fs.writeFile(itemsPath, JSON.stringify(data, null, 2), 'utf-8')

      return { success: true, item: newItem }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }
)

ipcMain.handle(
  'update-vault-item',
  async (
    _,
    id: number,
    itemData: { name: string; artist: string; description: string }
  ) => {
    const fs = await import('fs/promises')
    const path = await import('path')
    try {
      const appPath = app.getAppPath()
      const itemsPath = isDev
        ? path.join(appPath, 'vault-items.json')
        : path.join(path.dirname(app.getPath('exe')), 'data/vault-items.json')

      // Read current data
      const content = await fs.readFile(itemsPath, 'utf-8')
      const data = JSON.parse(content)

      // Find and update item
      const itemIndex = data.items.findIndex(
        (item: VaultItem) => item.id === id
      )
      if (itemIndex === -1) {
        return { success: false, error: 'Item not found' }
      }

      // Update item while preserving ID
      data.items[itemIndex] = {
        id,
        ...itemData,
      }

      // Write back to file
      await fs.writeFile(itemsPath, JSON.stringify(data, null, 2), 'utf-8')

      return { success: true, item: data.items[itemIndex] }
    } catch (error) {
      return { success: false, error: (error as Error).message }
    }
  }
)

ipcMain.handle(
  'get-item-image',
  async (_, itemName: string, artist: string) => {
    const fs = await import('fs/promises')
    const path = await import('path')
    try {
      // Create filename from item name and artist
      const filename = `${itemName}-${artist}`.replace(/[^a-zA-Z0-9-]/g, '_')

      // Look for images in the images directory
      const appPath = app.getAppPath()
      const imagesDir = isDev
        ? path.join(appPath, 'src', 'images')
        : path.join(path.dirname(app.getPath('exe')), 'data/images')

      // Try different image extensions
      const extensions = ['.jpg', '.jpeg', '.png', '.webp', '.svg']

      for (const ext of extensions) {
        const imagePath = path.join(imagesDir, filename + ext)
        try {
          const imageBuffer = await fs.readFile(imagePath)
          const base64 = imageBuffer.toString('base64')
          const mimeType =
            ext === '.png'
              ? 'image/png'
              : ext === '.webp'
                ? 'image/webp'
                : ext === '.svg'
                  ? 'image/svg+xml'
                  : 'image/jpeg'
          return {
            success: true,
            image: `data:${mimeType};base64,${base64}`,
            filename: filename + ext,
          }
        } catch {
          // Continue to next extension
        }
      }

      return { success: false, error: 'Image not found', image: null }
    } catch (error) {
      return { success: false, error: (error as Error).message, image: null }
    }
  }
)
