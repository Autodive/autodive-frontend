<template>
  <Prompt :baseURL="baseURL" :tokenName="tokenName"></Prompt>
</template>

<script setup>
import { Prompt } from 'autodive-pages-resource'
import { baseURL, tokenName } from '@/config'
</script>
