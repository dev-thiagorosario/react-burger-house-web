import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import './index.css'
import Header from './components/Header'

createRoot(document.getElementById('root') as HTMLElement).render(
  <StrictMode>
    <Header />
    <App />
  </StrictMode>,
)
