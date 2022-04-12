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
                    <v-checkbox
                      inset
                      v-model="botDetails.remember"
                      label="Remember this bot"
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
                      :color="'success' ? item.state == 1 : 'error' ? item.state == 2 : 'grey'"
                      rounded
                      class="w-100 my-1"
                      border="1px solid grey"
                    >
                      <v-list-item-title class="w-100">
                        <span>{{ item.name }}</span>
                        <div class="float-right d-flex ml-auto">
                          <div>
                            <v-icon> mdi-heart </v-icon>
                            <span>10</span>
                          </div>
                          <div class="ml-5">
                            <v-icon> mdi-shield </v-icon>
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
              <v-card class="ma-3 pa-3" elevation="1" outlined rounded shaped>
                <v-card-title>Quick Access</v-card-title>
                <v-card-text>
                  <v-chip
                    class="ma-2"
                    :color="state.workerServerConnected ? 'green' : 'red'"
                    text-color="white"
                  >
                    Worker Online
                  </v-chip>
                  <v-chip
                    class="ma-2"
                    :color="state.controlPanelServerConnected ? 'green' : 'red'"
                    text-color="white"
                  >
                    Server Online
                  </v-chip>
                  <v-btn color="primary" @click="testSocket">Test Socket</v-btn>
                  <v-btn color="primary" @click="testSocket2"
                    >Test Worker Socket</v-btn
                  >
                  <v-btn color="primary" @click="updateState"
                    >Refresh State</v-btn
                  >
                </v-card-text>
              </v-card>
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
    testText: "",
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
    state: {
      workerServerConnected: false,
      controlPanelServerConnected: false,
    },
  }),
  methods: {
    testSocket() {
      this.$store.state.socket.emit("controlPanel.test", "Hello from Vue!");
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
      if (this.botDetails.remember) this.saveServer();
      this.$store.state.socket.emit("controlPanel.createBot", botDetails2);
    },
    updateState() {
      this.$store.state.socket.emit("controlPanel.updateState");
    },
    fillDefaultValue() {
      if (this.getServer() != null)
       this.botDetails = this.getServer();
      else {
        this.botDetails.serverPort = "25565";
        this.botDetails.serverVersion = this.serverVersions[0];
      }
    },
    saveServer() {
      localStorage.setItem("serverDetails", JSON.stringify(this.botDetails));
    },
    getServer() {
      return JSON.parse(localStorage.getItem("serverDetails"));
    },
    registerEvents() {
      this.$store.state.socket.on("controlPanel.botCreated", (botDetails, err) => {
        this.activeBot.push({
          name: botDetails.username,
          health: 0,
          hunger: 0,
        });
      });
      this.$store.state.socket.on("controlPanel.botError", (bot, err) => {
        let errorBot = this.activeBot.find(x => x.uuid == bot.details.uuid)
        if (errorBot)
          this.$set(errorBot, 'state', bot.state)
      });
      this.$store.state.socket.on("controlPanel.botDisconnected", (bot, botList) => {
        let disconnectedBot = this.activeBot.find(x => x.uuid == bot.details.uuid)
        if (disconnectedBot)
          this.$set(disconnectedBot, 'state', bot.state)
      });
      this.$store.state.socket.on("controlPanel.stateUpdated", (x) => {
        this.state.workerServerConnected = x.worker.connected;
        this.state.controlPanelServerConnected = x.controlPanel.connected;
      });
    },
  },
  async mounted() {
    await this.$store.dispatch("createSocket");
    this.registerEvents();
    this.fillDefaultValue();
    this.updateState();
  },
};
</script>

<style scoped>
.w-100 {
  width: 100%;
}
</style>