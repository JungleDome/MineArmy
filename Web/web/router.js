import * as Vue from "vue";
import * as VueRouter from "vue-router";
import Home from "./views/Home.vue";
import Settings from "./views/Settings.vue";

const routes = [
    {
        path: "/",
        name: "Home",
        component: Home,
    },
    {
        path: "/settings",
        name: "Settings",
        component: Settings,
    },
];

const router = VueRouter.createRouter({
    history: VueRouter.createWebHistory(),
    routes,
});

export default router;