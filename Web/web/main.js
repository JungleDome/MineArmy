import * as Vue from "vue";
import * as VueX from "vuex"

import 'vuetify/styles' // Global CSS has to be imported
// import "@mdi/font/css/materialdesignicons.css";
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import App from "./App.vue"
import router from "./router"
import store from './components/store/store.js'

const vuetify = createVuetify({
    components,
    directives,
    theme: {
        variations: {
            colors: ['primary', 'secondary'],
            lighten: 2,
            darken: 2,
        },
    }
})

// new Vue({
//     router,
//     render: (h) => h(App),
// }).$mount("#app");

Vue.createApp(App).use(VueX).use(vuetify).use(router).use(store).mount('#app')