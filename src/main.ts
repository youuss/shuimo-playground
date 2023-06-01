import { createApp } from 'vue'
import App from './App.vue'
import 'splitpanes/dist/splitpanes.css'
import 'virtual:windi.css'
import './styles/main.css'
import { createMUI } from 'shuimo-ui';
import 'shuimo-ui/dist/style.css';

createApp(App).use(createMUI()).mount('#app')
