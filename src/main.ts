import { createElement } from 'react'
import { createRoot } from 'react-dom/client'
import './style.css'
import { App } from './ui/App.tsx'

const rootElement = document.querySelector<HTMLDivElement>('#app')
if (!rootElement) {
  throw new Error('App root was not found.')
}

createRoot(rootElement).render(createElement(App))
