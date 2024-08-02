<template>
  <Resource :baseURL="baseURL" :tokenName="tokenName"></Resource>
</template>

<script setup>
import { Resource } from 'autodive-pages-resource'
import { baseURL, tokenName } from '@/config'
</script>
