import * as Vue from "vue";

import 'vuetify/styles' // Global CSS has to be imported
// import "@mdi/font/css/materialdesignicons.css";
import { createVuetify } from 'vuetify'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import App from "./App.vue";
import router from "./router";

const vuetify = createVuetify({
    components,
    directives,
})

// new Vue({
//     router,
//     render: (h) => h(App),
// }).$mount("#app");

Vue.createApp(App).use(vuetify).use(router).mount('#app');