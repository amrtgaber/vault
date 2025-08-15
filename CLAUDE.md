# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `pnpm dev` - Start Vite development server for the React frontend
- `pnpm electron:dev` - Run full Electron application in development mode (includes Vite dev server + Electron)
- `pnpm build` - Build both TypeScript and Vite for production
- `pnpm electron:build` - Build and package Electron application
- `pnpm electron:dist` - Build and create distribution packages
- `pnpm preview` - Preview production build locally

## Architecture Overview

This is an Electron application built with React, TypeScript, and TanStack Router. The project follows a dual-process architecture:

### Main Process (Electron)
- Entry point: `electron/main.ts`
- Handles window creation, file system operations via IPC
- Preload script: `electron/preload.ts` for secure IPC communication
- Builds to `dist-electron/` directory

### Renderer Process (React Frontend)
- Entry point: `src/main.tsx`
- Uses TanStack Router for client-side routing with file-based route generation
- Routes defined in `src/routes/` with auto-generated route tree
- Builds to `dist/` directory

### Key Technologies
- **Frontend**: React 19, TanStack Router, Tailwind CSS with shadcn/ui components
- **Build**: Vite with electron plugins for seamless development
- **Styling**: Tailwind CSS v4 with CSS variables for theming
- **Type Safety**: TypeScript with strict configuration

### Project Structure
- `electron/` - Electron main and preload processes
- `src/routes/` - File-based routing with TanStack Router
- `src/components/` - Reusable React components
- `src/lib/` - Utility functions and shared libraries
- `src/app/globals.css` - Global styles and Tailwind imports

### Component System
- Uses shadcn/ui component library with Tailwind CSS
- Components configured via `components.json`
- Path aliases: `@/` maps to `src/`

### IPC Communication
The main process exposes file system operations through IPC:
- `get-app-version` - Returns Electron app version
- `read-file` - Reads file content from filesystem
- `write-file` - Writes content to filesystem

### Development Notes
- Development server runs on `http://localhost:5173`
- Hot reloading enabled for both main and renderer processes
- DevTools automatically open in development mode
- Router devtools available in development