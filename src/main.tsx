import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './app/app' // Adjust this path if main.tsx is in /src
import './index.css' // Ensure your Tailwind styles are loaded

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)