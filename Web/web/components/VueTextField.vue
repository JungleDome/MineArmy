<template>
  <v-text-field
    class="mb-2 rounded"
    :label="label"
    :required="isRequired"
    color="primary"
    variant="outlined"
    hide-details="auto"
    density="compact"
    shaped
    rounded
  ></v-text-field>
</template>

<script>
export default {
  props: {
    label: String,
    // modelValue: Object,
    isRequired: Boolean,
  },
  // computed: {
  //   value: {
  //     get() {
  //       return this.modelValue
  //     },
  //     set(value) {
  //       this.$emit('update:modelValue', value)
  //     }
  //   }
  // }
};
</script>

<style>
</style>