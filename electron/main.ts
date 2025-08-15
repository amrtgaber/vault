import { app, BrowserWindow, ipcMain } from 'electron'
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
    // In production, look for vault-items.json next to the executable
    // In development, look in the project root
    const appPath = app.getAppPath()
    const itemsPath = isDev 
      ? path.join(appPath, 'vault-items.json')
      : path.join(path.dirname(app.getPath('exe')), 'vault-items.json')
    
    const content = await fs.readFile(itemsPath, 'utf-8')
    const data = JSON.parse(content)
    return { success: true, items: data.items }
  } catch (error) {
    return { success: false, error: (error as Error).message, items: [] }
  }
})

ipcMain.handle('get-item-image', async (_, itemName: string, artist: string) => {
  const fs = await import('fs/promises')
  const path = await import('path')
  try {
    // Create filename from item name and artist
    const filename = `${itemName}-${artist}`.replace(/[^a-zA-Z0-9-]/g, '_')
    
    // Look for images in the images directory
    const appPath = app.getAppPath()
    const imagesDir = isDev 
      ? path.join(appPath, 'src', 'images')
      : path.join(path.dirname(app.getPath('exe')), 'images')
    
    // Try different image extensions
    const extensions = ['.jpg', '.jpeg', '.png', '.webp', '.svg']
    
    for (const ext of extensions) {
      const imagePath = path.join(imagesDir, filename + ext)
      try {
        const imageBuffer = await fs.readFile(imagePath)
        const base64 = imageBuffer.toString('base64')
        const mimeType = ext === '.png' ? 'image/png' : 
                        ext === '.webp' ? 'image/webp' : 
                        ext === '.svg' ? 'image/svg+xml' : 'image/jpeg'
        return { 
          success: true, 
          image: `data:${mimeType};base64,${base64}`,
          filename: filename + ext
        }
      } catch {
        // Continue to next extension
      }
    }
    
    return { success: false, error: 'Image not found', image: null }
  } catch (error) {
    return { success: false, error: (error as Error).message, image: null }
  }
})
