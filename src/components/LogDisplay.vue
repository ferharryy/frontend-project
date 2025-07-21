<template>
    <div class="bg-white rounded-lg p-6 shadow-md mb-6">
      <h3 class="text-xl font-semibold mb-4 text-gray-800">Logs Recentes</h3>
      <div v-if="loadingLogs" class="text-center text-gray-500 py-4">
        Carregando logs...
      </div>
      <div v-else-if="logs.length === 0" class="text-center text-gray-500 py-4">
        Nenhum log disponível.
      </div>
      <div v-else class="max-h-96 overflow-y-auto border border-gray-200 rounded-md">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nível</th>
              <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mensagem</th>
              <!-- <th class="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contexto</th> -->
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="logEntry in logs" :key="logEntry.id" :class="getLogLevelClass(logEntry.level)">
              <td class="px-4 py-2 whitespace-nowrap text-xs text-gray-700">{{ formatTimestamp(logEntry.timestamp) }}</td>
              <td class="px-4 py-2 whitespace-nowrap text-xs font-semibold">{{ logEntry.level }}</td>
              <td class="px-4 py-2 text-xs text-gray-700">{{ logEntry.message }}</td>
              <!-- <td class="px-4 py-2 text-xs text-gray-700">{{ logEntry.context ? JSON.stringify(logEntry.context) : '-' }}</td> -->
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onUnmounted } from 'vue';
  import { getLogs } from '@/services/logService'; // Importa o serviço de logs
  
  const logs = ref([]);
  const loadingLogs = ref(true);
  let pollingInterval = null; // Variável para armazenar o ID do intervalo de polling
  
  const fetchLogs = async () => {
    loadingLogs.value = true;
    try {
      const fetchedLogs = await getLogs(20); // Busca os 20 logs mais recentes
      logs.value = fetchedLogs;
    } catch (error) {
      console.error("Erro ao carregar logs:", error);
      // Poderia adicionar uma mensagem de erro na UI aqui
    } finally {
      loadingLogs.value = false;
    }
  };
  
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '-';
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  };
  
  const getLogLevelClass = (level) => {
    switch (level.toLowerCase()) {
      case 'error':
        return 'bg-red-50 text-red-800';
      case 'warn':
        return 'bg-yellow-50 text-yellow-800';
      case 'info':
      default:
        return 'text-gray-900';
    }
  };
  
  onMounted(() => {
    fetchLogs(); // Busca os logs na montagem inicial
    // Configura o polling para buscar logs a cada 10 segundos (10000 ms)
    pollingInterval = setInterval(fetchLogs, 10000);
  });
  
  onUnmounted(() => {
    // Limpa o intervalo de polling quando o componente é desmontado para evitar vazamento de memória
    if (pollingInterval) {
      clearInterval(pollingInterval);
    }
  });
  </script>
  
  <style scoped>
  /* Adicione estilos específicos para LogDisplay.vue aqui, se necessário */
  </style>
  