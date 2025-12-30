import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './App.css'

// Remove the old Vite default styles
// import './index.css'

console.log('ZimPay: main.tsx loaded')

const rootElement = document.getElementById('root')
if (!rootElement) {
  console.error('Root element not found!')
} else {
  console.log('ZimPay: Mounting React app...')
  createRoot(rootElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
  console.log('ZimPay: React app mounted')
}
