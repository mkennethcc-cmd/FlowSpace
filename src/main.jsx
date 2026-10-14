import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { supabase } from './supabase'
import { initNative } from './native'

// Only does anything inside the iOS/Android app — status bar, back button, sign-in links coming back.
initNative(supabase)

// The website opens without a connection (public/sw.js). Only for the real site: not while developing
// (it would fight the live reload), and not inside the phone or desktop app, which carry their own files.
if (import.meta.env.PROD && 'serviceWorker' in navigator && location.protocol.startsWith('http') && !window.Capacitor) {
  window.addEventListener('load', () => { navigator.serviceWorker.register('./sw.js').catch(() => {}) })
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
