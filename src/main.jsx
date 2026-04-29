import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { BrowserRouter } from 'react-router-dom'
import { FleetOpsProvider } from './context'
import { LayoutProvider } from './context/LayoutContext'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <FleetOpsProvider>
        <LayoutProvider>
          <App />
        </LayoutProvider>
      </FleetOpsProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
