import { createApp } from 'vue'

// import GridLayout from 'vue3-drr-grid-layout'
// import 'vue3-drr-grid-layout/dist/style.css'

import App from './App.vue'
import router from './router'

createApp(App)
  .use(router)
  // .use(GridLayout)
  .mount('#app')
