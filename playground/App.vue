<script setup lang="ts">
import {SingleDatePicker} from '../src'
import {ref} from 'vue'

const date = ref(new Date())
</script>

<template>
  <div>{{date.toDateString()}}</div>
  <div class="container">
    <SingleDatePicker :available-range="[new Date(2025, 0, 1), null]" v-model="date" @close="" />
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
