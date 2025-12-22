import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ThemeInit } from '../.flowbite-react/init'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeInit />
    <App />
  </StrictMode>,
)
