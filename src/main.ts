import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

// 引入 UI 设计规范
import './assets/design-system.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
