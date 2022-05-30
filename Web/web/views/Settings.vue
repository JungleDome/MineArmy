<template>
  <div>
    <v-container>
      <v-row>
        <v-col cols="12" md="12">
          <v-card class="ma-3 pa-3" elevation="1" outlined rounded shaped>
            <v-card-title>Settings</v-card-title>
            <v-card-text>
              <v-form ref="form">
                <v-switch v-model="formData.darkMode" hide-details inset :label="`Dark mode: ${formData.darkMode}`" @update:modelValue="saveSettings"></v-switch>
              </v-form>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </div>
</template>

<script>
export default {
  data: () => ({
    formData: {}
  }),
  methods: {
    saveSettings() {
      localStorage.setItem("settings", JSON.stringify(this.formData));
      this.$nextTick(() => {
        this.$store.dispatch("loadSettings")
      })
    },
    getSettings() {
      this.$store.dispatch("loadSettings");
      return this.$store.state.settings;
    }
  },
  mounted() {
    this.formData = this.getSettings()
  }
};
</script>

<style scoped>
.w-100 {
  width: 100%;
}
</style>