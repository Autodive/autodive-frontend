<template>
  <div class="logo" v-if="logo">
    <router-link to="/main/welcome">
      <img :src="logo">
    </router-link>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'
import { config } from '@/config'
const logo = ref('')
onMounted(async () => {
  logo.value = config.logo || ''
})
</script>

<style lang="scss" scoped>
.logo {
  width: 100px;
  text-align: center;
  display: flex;
  align-items: center;
  padding-left: 10px;
  padding-right: 20px;
  img {
    width: 100%;
  }
}
</style>
