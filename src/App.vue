<template>
  <div id="app">
    <BaseToast ref="toastRef" />
    <router-view />
  </div>
</template>

<script setup>
import { ref, provide } from 'vue'
import BaseToast from '@/components/BaseToast.vue'

// Criando uma referência para o componente
const toastRef = ref(null)

// Fornece a função globalmente via provide
provide('toast', {
  show: (msg, type = 'info') => {
    toastRef.value?.showToast(msg, type)
  }
})
</script>
