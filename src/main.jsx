import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { HashRouter as Router } from 'react-router-dom' // Cuando dio problemas el servidor, cambiamos BrowserRouter por HashRouter

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Router> {/* Ahora est usando HashRouter */}
      <App />
    </Router>
  </React.StrictMode>,
)