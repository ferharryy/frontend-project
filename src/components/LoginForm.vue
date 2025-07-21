<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h2 class="text-2xl font-bold text-center mb-6 text-gray-800">Login</h2>
      <form @submit.prevent="handleLogin">
        <div class="mb-4">
          <label for="username" class="block text-gray-700 text-sm font-bold mb-2">Usuário:</label>
          <input
            type="text"
            id="username"
            v-model="username"
            required
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
            placeholder="Digite seu usuário"
          >
        </div>
        <div class="mb-6">
          <label for="password" class="block text-gray-700 text-sm font-bold mb-2">Senha:</label>
          <input
            type="password"
            id="password"
            v-model="password"
            required
            class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline focus:border-blue-500"
            placeholder="Digite sua senha"
          >
        </div>
        
        <!-- Div explícita para criar o espaçamento entre os campos e o botão -->
        <div class="h-6"></div> <!-- h-6 no Tailwind CSS corresponde a 1.5rem ou 24px de altura -->

        <button
          type="submit"
          class="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full transition duration-300 ease-in-out"
          :disabled="loading"
        >
          {{ loading ? 'Entrando...' : 'Entrar' }}
        </button>
        <p v-if="error" class="text-red-500 text-center text-sm mt-4">{{ error }}</p>
        <p v-if="token" class="text-green-500 text-center text-sm mt-4">Login bem-sucedido! Redirecionando...</p>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/authStore'; // Importe o authStore
import { storeToRefs } from 'pinia'; // <-- Importe storeToRefs para variáveis reativas, se precisar


const username = ref('');
const password = ref('');
const error = ref(null);
const token = ref(null);
const loading = ref(false);

const router = useRouter();

// --- CORREÇÃO AQUI ---
// 1. Instancie o authStore para ter acesso ao objeto completo.
const authStore = useAuthStore();
// 2. Desestruture APENAS as funções (ações) que você vai chamar diretamente.
const { setUsername, setAuthenticated } = authStore; 
// Se você precisasse acessar 'username' ou 'isAuthenticated' diretamente no template
// e eles não fossem usados como 'authStore.username', você usaria storeToRefs:
// const { username: authUsername, isAuthenticated: authIsAuthenticated } = storeToRefs(authStore);
// Mas para este componente, só precisamos das funções.
// --- FIM DA CORREÇÃO ---


const API_BASE_URL = 'http://localhost:8080/auth';

const handleLogin = async () => {
  error.value = null;
  token.value = null;
  loading.value = true;

  try {
    const response = await axios.post(`${API_BASE_URL}/login`, {
      username: username.value,
      password: password.value
    });

    if (response.status === 200) {
      const receivedToken = response.data.token;
      token.value = receivedToken;
      localStorage.setItem('jwt_token', receivedToken);
      console.log('Login successful! Token stored in localStorage:', receivedToken);

      // Configurar Axios para enviar o token em futuras requisições
      axios.defaults.headers.common['Authorization'] = `Bearer ${receivedToken}`;

      // Decodificar o token para obter o username
      try {
        const decodedToken = JSON.parse(atob(receivedToken.split('.')[1]));
        const usernameFromToken = decodedToken.sub; 
        
        // --- CORREÇÃO AQUI ---
        // Chame as funções diretamente, agora que foram desestruturadas
        setUsername(usernameFromToken); // CORRIGIDO!
        setAuthenticated(true);         // CORRIGIDO!
        // --- FIM DA CORREÇÃO ---

        console.log('User username from token:', usernameFromToken); // console.log ajustado para usernameFromToken

      } catch (decodeError) {
        console.error("Erro ao decodificar JWT para obter username após login:", decodeError); // Mensagem ajustada
        // Se não conseguir decodificar, limpa a autenticação ou trata o erro
        setUsername(null); // Define o username como null ou para um valor padrão
        setAuthenticated(false); // Garante que não está autenticado
        localStorage.removeItem('jwt_token'); // Remove o token inválido
        error.value = 'Erro ao processar token de login. Tente novamente.'; // Mensagem para o usuário
      }

      // Redireciona para a Home após login bem-sucedido
      router.push('/home');

    }
  } catch (err) {
    if (err.response) {
      if (err.response.status === 401) {
        error.value = 'Credenciais inválidas. Por favor, verifique seu usuário e senha.';
      } else {
        error.value = err.response.data.message || 'Ocorreu um erro no servidor. Tente novamente.';
      }
    } else if (err.request) {
      error.value = 'Não foi possível conectar ao servidor. Verifique sua conexão ou se o servidor está rodando.';
    } else {
      error.value = 'Ocorreu um erro inesperado. Tente novamente.';
      console.error('Erro de configuração do Axios:', err.message);
    }
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Estilos Tailwind aqui */
</style>
