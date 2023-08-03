import { createApp } from 'vue'
import VueSecureHTML from 'vue-html-secure'

import App from './App.vue'
import router from './router'

createApp(App)
  .use(router)
  .use(VueSecureHTML)
  .mount('#app')
