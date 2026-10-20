import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { useLang } from './i18n'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// Beim Sprachwechsel wird die ganze App mit den neuen Texten neu aufgebaut
function Root() {
  const lang = useLang()
  return <App key={lang} />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
    <ToastContainer
      position="top-right"
      autoClose={3500}
      hideProgressBar={false}
      newestOnTop
      closeOnClick
      pauseOnHover
      theme="colored"
    />
  </StrictMode>,
)
