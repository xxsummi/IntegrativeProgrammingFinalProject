import { createApp } from 'vue'
import App from './App.vue'
import router from './router'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

// Suppress ResizeObserver loop limit exceeded error
const resizeObserverErrorHandler = (e) => {
  if (e.message === 'ResizeObserver loop limit exceeded' || 
      e.message === 'ResizeObserver loop completed with undelivered notifications.') {
    const resizeObserverErrDiv = document.getElementById('webpack-dev-server-client-overlay-div')
    const resizeObserverErr = document.getElementById('webpack-dev-server-client-overlay')
    if (resizeObserverErr) {
      resizeObserverErr.setAttribute('style', 'display: none')
    }
    if (resizeObserverErrDiv) {
      resizeObserverErrDiv.setAttribute('style', 'display: none')
    }
  }
}
window.addEventListener('error', resizeObserverErrorHandler)

const app = createApp(App)

// Global error handler for Vue
app.config.errorHandler = (err) => {
  if (err.message && err.message.includes('ResizeObserver')) {
    return
  }
  console.error(err)
}

app.use(router)
app.use(ElementPlus)
app.mount('#app')
