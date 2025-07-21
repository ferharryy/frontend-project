<template>
  <div class="flex flex-col h-full bg-white rounded-lg shadow-sm border border-gray-200">
    <div class="flex items-center justify-between p-4 border-b border-gray-200 bg-gray-50 rounded-t-lg">
      <h2 class="text-xl font-semibold text-gray-800">
        Chat com LyvIA
        <span v-if="authStore.username" class="text-blue-700">({{ authStore.username }})</span>
      </h2>
      <div class="flex items-center space-x-2">
        <span class="text-sm text-gray-600">Status: <span :class="{'text-green-500': isLyvIAOnline, 'text-red-500': !isLyvIAOnline}">{{ isLyvIAOnline ? 'Online' : 'Offline' }}</span></span>
      </div>
    </div>

    <div class="flex-1 p-4 overflow-y-auto custom-scrollbar" ref="chatMessages">
      <div v-for="message in messages" :key="message.id" class="mb-4">
        <div v-if="message.sender === 'user'" class="flex justify-end">
          <div class="bg-blue-500 text-white p-3 rounded-lg max-w-xs md:max-w-md break-words shadow-md">
            {{ message.text }}
            <span class="block text-right text-xs opacity-75 mt-1">{{ formatTime(message.timestamp) }}</span>
          </div>
        </div>
        <div v-else class="flex justify-start">
          <div class="bg-gray-200 text-gray-800 p-3 rounded-lg max-w-xs md:max-w-md break-words shadow-md">
            <span class="font-bold text-blue-700">LyvIA:</span> {{ message.text }}
            <span class="block text-right text-xs opacity-75 mt-1">{{ formatTime(message.timestamp) }}</span>
          </div>
        </div>
      </div>
      <div v-if="isTyping" class="flex justify-start">
        <div class="bg-gray-200 text-gray-800 p-3 rounded-lg max-w-xs md:max-w-md shadow-md">
          <span class="font-bold text-blue-700">LyvIA</span> está digitando...
        </div>
      </div>
    </div>

    <div class="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
      <div class="flex space-x-3">
        <input
          v-model="currentMessage"
          @keyup.enter="sendMessage"
          :disabled="isSending"
          placeholder="Digite sua mensagem..."
          class="flex-1 border border-gray-300 rounded-md px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
        />
        <button
          @click="sendMessage"
          :disabled="!currentMessage.trim() || isSending"
          class="bg-blue-600 text-white px-5 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          <svg v-if="isSending" class="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span v-else>Enviar</span>
        </button>
      </div>
      <p v-if="errorMessage" class="text-red-500 text-sm mt-2">{{ errorMessage }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick, onUnmounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';
import { storeToRefs } from 'pinia';

const authStore = useAuthStore();
const { username } = storeToRefs(authStore);

const chatMessages = ref(null);

const messages = ref([]);
const currentMessage = ref('');
const isSending = ref(false);
const isTyping = ref(false);
const errorMessage = ref('');

const isLyvIAOnline = ref(true);

const formatTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const scrollToBottom = () => {
  nextTick(() => {
    if (chatMessages.value) {
      chatMessages.value.scrollTop = chatMessages.value.scrollHeight;
    }
  });
};

const sendMessage = async () => {
  console.log('Chat Component: Username (desestruturado) no início do sendMessage:', username.value);

  if (!username.value) {
    errorMessage.value = 'Erro: Nome de usuário não disponível. Por favor, faça login novamente.';
    return;
  }

  errorMessage.value = '';
  isSending.value = true;
  isTyping.value = true;

  const userMessageText = currentMessage.value;
  messages.value.push({
    id: Date.now(),
    sender: 'user',
    text: userMessageText,
    timestamp: new Date().toISOString()
  });
  currentMessage.value = '';

  scrollToBottom();

  try {
    const response = await axios.post(
      'http://localhost:8080/chat-v1',
      {
        userId: username.value,
        message: userMessageText
      }
    );

    // --- CORREÇÃO FINAL AQUI ---
    // Agora acessamos response.data.content.string
    if (response.data && response.data.content && (response.data.content.string || response.data.content.chars)) {
      messages.value.push({
        id: Date.now() + 1,
        sender: 'LyvIA',
        // Usamos response.data.content.string ou response.data.content.chars
        text: response.data.content.string || response.data.content.chars, 
        timestamp: new Date().toISOString()
      });
    } else {
      errorMessage.value = 'Resposta inesperada da LyvIA: Formato de mensagem não reconhecido.';
      console.error('Resposta da LyvIA em formato inesperado:', response.data); // Log para depuração
    }
    // --- FIM DA CORREÇÃO ---

  } catch (error) {
    console.error('Erro ao enviar mensagem para LyvIA:', error);
    errorMessage.value = 'Não foi possível conectar com a LyvIA. Por favor, tente novamente.';
    isLyvIAOnline.value = false;
  } finally {
    isSending.value = false;
    isTyping.value = false;
    scrollToBottom();
  }
};

watch(messages.value, () => {
  scrollToBottom();
});
</script>