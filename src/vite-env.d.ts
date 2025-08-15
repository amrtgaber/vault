/// <reference types="vite/client" />

interface VaultItem {
  id: string
  name: string
  artist: string
  description: string
}

interface ElectronAPI {
  getAppVersion: () => Promise<string>
  readFile: (
    filePath: string
  ) => Promise<{ success: boolean; content?: string; error?: string }>
  writeFile: (
    filePath: string,
    content: string
  ) => Promise<{ success: boolean; error?: string }>
  getVaultItems: () => Promise<{ success: boolean; items: VaultItem[]; error?: string }>
  getItemImage: (itemName: string, artist: string) => Promise<{ 
    success: boolean; 
    image: string | null; 
    filename?: string;
    error?: string 
  }>
}

declare global {
  interface Window {
    electronAPI: ElectronAPI
  }
}
