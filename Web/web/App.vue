<template>
  <v-app :theme="theme">
    <v-layout>
      <v-app-bar color="primary">
        <template v-slot:prepend>
          <v-app-bar-nav-icon @click.stop="drawer = !drawer"></v-app-bar-nav-icon>
        </template>

        <v-app-bar-title>MineArmy Control Panel</v-app-bar-title>
      </v-app-bar>
      <v-navigation-drawer v-model="drawer" temporary>
        <v-list density="compact" nav>
          <v-list-item prepend-icon="mdi-view-dashboard" title="Home" value="home" to="/"></v-list-item>
          <v-list-item prepend-icon="mdi-forum" title="Settings" value="settings" to="/settings"></v-list-item>
        </v-list>
      </v-navigation-drawer>
      <v-main class="fill-height">
        <div class="main">
          <router-view />
        </div>
      </v-main>
    </v-layout>
  </v-app>
</template>

<script>
export default {
  data: () => ({
    drawer: false,
  }),
  computed: {
    theme: {
      get() {
        return this.$store.state.settings && this.$store.state.settings.darkMode ? "dark" : "light"
      }
    }
  },
  async mounted() {
    this.$store.dispatch("createSocket")
    this.$store.dispatch("loadSettings")
  },
};
</script>

<style lang="scss" scoped>
.main {
  // height: calc(100vh - 64px);
  min-height: calc(100vh - 64px);
}
</style>