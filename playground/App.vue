<script setup lang="ts">
import {SingleWeekPicker} from '../src'
import {ref} from 'vue'

const value = ref({weekYear: 2022, weekNum: 1})
</script>

<template>
  <div class="container">
    <SingleWeekPicker v-model="value" />
  </div>
</template>

<style scoped lang="scss">
.container {
  border: 1px solid #d8d8d8;
  background: white;
  border-radius: 0.5rem;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
</style>
