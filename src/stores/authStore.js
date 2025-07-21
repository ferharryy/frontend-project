// src/stores/authStore.js
import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const username = ref(null)
  const isAuthenticated = ref(false)

  function setUsername(name) {
    username.value = name
    isAuthenticated.value = !!name
  }

  function setAuthenticated(status) {
    isAuthenticated.value = status
  }

  function clearAuth() {
    username.value = null
    isAuthenticated.value = false
    localStorage.removeItem('jwt_token')
  }

  // Carrega o token salvo no localStorage, se existir
  const token = localStorage.getItem('jwt_token')
  if (token) {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]))
      console.log('authStore: Token decodificado, payload:', payload);
      setUsername(payload.sub)
    } catch (e) {
      console.error('authStore: Erro ao decodificar token:', e)
      clearAuth()
    }
  } else {
    console.log('authStore: Nenhum token encontrado no localStorage.');
  }

  return {
    username,
    isAuthenticated,
    setUsername,
    setAuthenticated,
    clearAuth
  }
})
