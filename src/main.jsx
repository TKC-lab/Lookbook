import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import { seedIfNeeded } from './lib/seed.js'
import './index.css'

seedIfNeeded()

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
