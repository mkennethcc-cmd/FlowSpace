import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { supabase } from './supabase'
import { initNative } from './native'

// Only does anything inside the iOS/Android app — status bar, back button, sign-in links coming back.
initNative(supabase)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
