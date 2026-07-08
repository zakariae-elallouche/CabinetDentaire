import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import './index.css'
import { AuthProvider } from './context/AuthContext'
import DialogProvider from './components/DialogProvider'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AuthProvider>
      <App />
      <ToastContainer
        position="bottom-right"
        autoClose={3500}
        hideProgressBar
        closeButton={false}
        toastClassName="hz-toast"
      />
      <DialogProvider />
    </AuthProvider>
  </StrictMode>
)
