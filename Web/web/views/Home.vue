<template>
  <h1>Hello Vue123</h1>
  <v-list v-model:opened="open"> </v-list>
  <v-container>
    <v-row class="flex-child">
      <v-col class="d-flex" cols="12" md="4">
        <v-sheet class="d-flex" color="grey lighten-3">
          <h5>Bot name</h5>
        </v-sheet>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data: () => ({
    message: "Hello World!",
  }),
};
</script>