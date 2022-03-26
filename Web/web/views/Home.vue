<template>
  <div>
    <v-tabs
      v-model="tab"
      background-color="primary-lighten-1"
      center-active
      show-arrows
    >
      <v-tab v-for="item in items" :key="item" :value="item">
        {{ item }}
      </v-tab>
    </v-tabs>

    <v-window v-model="tab">
      <v-window-item value="main">
        <v-container>
          <v-row>
            <v-col cols="12" md="4">
              <v-card class="ma-3 pa-3" elevation="1" outlined rounded shaped>
                <v-card-title>Deploy New Bot</v-card-title>
                <v-card-text>
                  <v-form ref="form" v-model="valid">
                    <vue-text-field
                      v-model="botDetails.serverIP"
                      label="Server IP"
                      :isRequired="true"
                    ></vue-text-field>
                    <vue-text-field
                      v-model="botDetails.serverPort"
                      label="Server Port"
                      :isRequired="true"
                    ></vue-text-field>
                    <v-select
                      class="mb-2"
                      v-model="botDetails.serverVersion"
                      label="Server Version"
                      :items="serverVersions"
                      required
                      color="primary"
                      variant="outlined"
                      hide-details="auto"
                      density="compact"
                    ></v-select>
                    <vue-text-field
                      v-model="botDetails.username"
                      label="Username"
                      :isRequired="true"
                    ></vue-text-field>
                    <vue-text-field
                      v-model="botDetails.password"
                      label="Password"
                      :isRequired="true"
                    ></vue-text-field>
                    <v-checkbox
                      inset
                      v-model="botDetails.isCracked"
                      label="Cracked ?"
                      hide-details="auto"
                      density="compact"
                      color="primary"
                    ></v-checkbox>
                  </v-form>
                </v-card-text>
                <v-card-actions class="float-right">
                  <v-btn color="primary" @click="deployBot">Deploy</v-btn>
                </v-card-actions>
              </v-card>
            </v-col>
            <v-col cols="12" md="4">
              <v-card class="ma-3 pa-3" elevation="1" outlined rounded shaped>
                <v-card-title>Active Bot</v-card-title>
                <v-card-text>
                  <v-list>
                    <v-list-item
                      v-for="(item, i) in activeBot"
                      :key="i"
                      :value="item"
                      active-color="primary"
                      rounded
                      class="w-100 my-1"
                      border="1px solid grey"
                    >
                      <v-list-item-title class="w-100">
                        <span>{{ item.name }}</span>
                        <div class="float-right d-flex ml-auto">
                          <div>
                            <v-icon>
                              mdi-heart
                            </v-icon>
                            <span>10</span>
                          </div>
                          <div class="ml-5">
                            <v-icon>
                              mdi-shield
                            </v-icon>
                            <span>10</span>
                          </div>
                        </div>
                      </v-list-item-title>
                    </v-list-item>
                  </v-list>
                </v-card-text>
              </v-card>
            </v-col>
            <v-col cols="12" md="4">
              <v-sheet class="ma-3 pa-3" elevation="1" outlined rounded shaped>
                <v-btn color="primary" @click="testSocket">Test Socket</v-btn>
                <v-btn color="primary" @click="testSocket2"
                  >Test Worker Socket</v-btn
                >
              </v-sheet>
            </v-col>
          </v-row>
        </v-container>
      </v-window-item>
      <v-window-item>
        <p>Hello!</p>
      </v-window-item>
    </v-window>
  </div>
</template>

<script>
import VueTextField from "../components/VueTextField.vue";

export default {
  components: {
    "vue-text-field": VueTextField,
  },
  data: () => ({
    botDetails: {},
    testText: '',
    tab: null,
    valid: true,
    items: ["main"],
    serverVersions: ["1.18.2", "1.18", "1.17"],
    activeBot: [
      // { avatarImg: "mdi-shield-outline", name: "bot 1" },
      // { avatarImg: "mdi-checkbox-marked-circle", name: "bot 2" },
      // { avatarImg: "mdi-checkbox-marked-circle", name: "bot 3" },
      // { avatarImg: "mdi-checkbox-marked-circle", name: "bot 4" },
    ],
  }),
  methods: {
    testSocket() {
      this.$store.state.socket.emit("cp.test", "Hello from Vue!");
    },
    testSocket2() {
      this.$store.state.socket.emit("mineflayer.test", "Hello from Vue!");
    },
    deployBot() {
      let botDetails2 = {
        serverIP: this.botDetails.serverIP,
        serverPort: this.botDetails.serverPort,
        serverVersion: this.botDetails.serverVersion,
        username: this.botDetails.username,
        password: this.botDetails.isCracked ? null : this.botDetails.password,
        offlinePassword: this.botDetails.isCracked
          ? this.botDetails.password
          : null,
      };
      this.$store.state.socket.emit("cp.createBot", botDetails2);
    },
    fillDefaultValue() {
      this.botDetails.serverPort = "25565";
      this.botDetails.serverVersion = this.serverVersions[0];
    },
    botCreated(bot, username, err) {
      if (err)
        console.log(err)
      else {
        // this.activeBot.push({
        //   name: username,
        //   health: bot.health,
        //   hunger: bot.hunger
        // })
      }
    }
  },
  mounted() {
    this.$store.commit("createSocket");
    this.fillDefaultValue();
  },
};
</script>

<style scoped>
.w-100 {
  width: 100%;
}
</style>