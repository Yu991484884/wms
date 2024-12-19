import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import ja from 'element-plus/es/locale/lang/ja'
import { createPinia } from "pinia"


const app = createApp(App)
const pinia = createPinia()


// ResizeObserverエラーを無視する
const observerErrorHandler = (err) => {
  if (err.message.includes('ResizeObserver')) {
    // エラーを無視
    return false;
  }
};

window.addEventListener('error', observerErrorHandler);

app.use(pinia); // Pinia を使用
app.use(ElementPlus, {
    locale: ja,
  }) // 使用ElementPlus
app.use(router) // 确保添加这一行来使用Vue Router

app.mount('#app')
