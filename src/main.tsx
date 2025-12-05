// @ts-ignore 找不到模块“vue”或其相应的类型声明
import { createApp } from 'vue'
import './index.css'
// @ts-ignore 找不到模块“./App.vue”或其相应的类型声明
import App from './App.vue'

const app = createApp(App)
app.mount('#root')
