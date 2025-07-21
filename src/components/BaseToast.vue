<template>
  <transition-group
    name="toast"
    tag="div"
    class="fixed top-5 right-5 z-50 flex flex-col space-y-2"
  >
    <div
      v-for="(toast, index) in toasts"
      :key="toast.id"
      :class="[
        'rounded shadow-md px-4 py-3 text-white',
        toast.type === 'success' ? 'bg-green-600' :
        toast.type === 'error' ? 'bg-red-600' :
        'bg-blue-600'
      ]"
    >
      {{ toast.message }}
    </div>
  </transition-group>
</template>

<script setup>
import { ref } from 'vue'

const toasts = ref([])

function showToast(message, type = 'info', duration = 3000) {
  const id = Date.now()
  toasts.value.push({ id, message, type })

  setTimeout(() => {
    toasts.value = toasts.value.filter(t => t.id !== id)
  }, duration)
}

defineExpose({ showToast })
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.3s ease;
}
.toast-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}
.toast-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
