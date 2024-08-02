<template>
  <div>
    <div class="title">
      Demo Component Counter: {{ count }}
    </div>
    <div><button @click="count++">increase</button></div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const count = ref(0)
</script>

<style lang="scss" scoped>
.title {
  color: green;
}
</style>
