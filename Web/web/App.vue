<template>
  <v-app>
    <v-layout >
      <v-app-bar color="primary">
        <template v-slot:prepend>
          <v-app-bar-nav-icon
            @click.stop="drawer = !drawer"
          ></v-app-bar-nav-icon>
        </template>

        <v-app-bar-title>MineArmy Control Panel</v-app-bar-title>
      </v-app-bar>
      <v-navigation-drawer v-model="drawer" temporary>
        <v-list density="compact" nav>
          <v-list-item
            prepend-icon="mdi-view-dashboard"
            title="Home"
            value="home"
            to="/"
          >
          </v-list-item>
          <v-list-item
            prepend-icon="mdi-forum"
            title="Settings"
            value="settings"
            to="/settings"
          ></v-list-item>
        </v-list>
      </v-navigation-drawer>
      <v-main>
        <router-view />
      </v-main>
    </v-layout>
  </v-app>
</template>

<script>
export default {
  data: () => ({
    drawer: false,
  }),
  mounted() {
    console.log("mount - socket");
    this.$store.commit("createSocket");
  },
};
</script>