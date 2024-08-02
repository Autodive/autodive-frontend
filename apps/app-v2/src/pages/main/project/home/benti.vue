<template>
  <Benti :baseURL="baseURL" :tokenName="tokenName"></Benti>
</template>

<script setup>
import { Benti } from 'autodive-pages-benti'
import { baseURL, tokenName } from '@/config'
</script>
