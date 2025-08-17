import { contextBridge, ipcRenderer } from 'electron'

export interface ElectronAPI {
  getAppVersion: () => Promise<string>
  readFile: (
    filePath: string
  ) => Promise<{ success: boolean; content?: string; error?: string }>
  writeFile: (
    filePath: string,
    content: string
  ) => Promise<{ success: boolean; error?: string }>
  getVaultItems: () => Promise<{
    success: boolean
    items: VaultItem[]
    error?: string
  }>
  addVaultItem: (itemData: {
    name: string
    artist: string
    description: string
  }) => Promise<{
    success: boolean
    item?: VaultItem
    error?: string
  }>
  updateVaultItem: (
    id: number,
    itemData: {
      name: string
      artist: string
      description: string
    }
  ) => Promise<{
    success: boolean
    item?: VaultItem
    error?: string
  }>
  getItemImage: (
    itemName: string,
    artist: string
  ) => Promise<{
    success: boolean
    image: string | null
    filename?: string
    error?: string
  }>
}

export interface VaultItem {
  id: number
  name: string
  artist: string
  description: string
}

const electronAPI: ElectronAPI = {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  readFile: (filePath: string) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath: string, content: string) =>
    ipcRenderer.invoke('write-file', filePath, content),
  getVaultItems: () => ipcRenderer.invoke('get-vault-items'),
  addVaultItem: (itemData) => ipcRenderer.invoke('add-vault-item', itemData),
  updateVaultItem: (id, itemData) => ipcRenderer.invoke('update-vault-item', id, itemData),
  getItemImage: (itemName: string, artist: string) =>
    ipcRenderer.invoke('get-item-image', itemName, artist),
}

contextBridge.exposeInMainWorld('electronAPI', electronAPI)

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
