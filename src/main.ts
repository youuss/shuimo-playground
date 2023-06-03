import { createApp } from 'vue'
import { createMUI } from 'shuimo-ui'
import App from './App.vue'
import 'splitpanes/dist/splitpanes.css'
import 'virtual:windi.css'
import './styles/main.css'
import 'shuimo-ui/dist/style.css'

createApp(App).use(createMUI()).mount('#app')
