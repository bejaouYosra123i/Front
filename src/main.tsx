
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import AuthContextProvider from './auth/auth.context.tsx'
import { BrowserRouter } from 'react-router-dom'

createRoot(document.getElementById('root')!).render(
  <BrowserRouter>
  <AuthContextProvider>
    <App />
  </AuthContextProvider>,
  </BrowserRouter>
)
