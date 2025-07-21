<template>
  <div class="min-h-screen w-full bg-gray-100 flex flex-col">
    <nav class="bg-blue-700 p-2 shadow-lg">
      <div class="w-full px-4 flex justify-between items-center">
        <div class="flex flex-wrap gap-4">
          <router-link
            to="/home"
            class="p-2 bg-blue-800 hover:bg-blue-900 rounded-md text-base font-semibold shadow transition flex items-center justify-center"
            title="Página Inicial"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-orange-300 hover:text-orange-100" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2 2v10a1 1 0 001 1h3m-6 0a1 1 0 001-1v-4a1 1 0 00-1-1H9a1 1 0 00-1 1v4a1 1 0 001 1h2a1 1 0 001-1z" />
            </svg>
          </router-link>

          <router-link
            to="/home/empresa"
            class="w-32 text-center bg-blue-800 hover:bg-blue-900 px-3 py-2 rounded-md text-base font-semibold shadow transition"
          >
            <span class="text-orange-300 hover:text-orange-100">Empresa</span>
          </router-link>

          <router-link
            to="/home/usuario"
            class="w-32 text-center bg-blue-800 hover:bg-blue-900 px-3 py-2 rounded-md text-base font-semibold shadow transition"
          >
            <span class="text-orange-300 hover:text-orange-100">Usuário</span>
          </router-link>

          <router-link
            to="/home/projeto"
            class="w-32 text-center bg-blue-800 hover:bg-blue-900 px-3 py-2 rounded-md text-base font-semibold shadow transition"
          >
            <span class="text-orange-300 hover:text-orange-100">Projeto</span>
          </router-link>

          <router-link
            to="/home/fluxo"
            class="w-32 text-center bg-blue-800 hover:bg-blue-900 px-3 py-2 rounded-md text-base font-semibold shadow transition"
          >
            <span class="text-orange-300 hover:text-orange-100">Fluxo</span>
          </router-link>

          <router-link
            to="/home/chat"
            class="w-32 text-center bg-blue-800 hover:bg-blue-900 px-3 py-2 rounded-md text-base font-semibold shadow transition"
          >
            <span class="text-orange-300 hover:text-orange-100">Chat</span>
          </router-link>

          <button
            @click="logout"
            class="w-32 text-center bg-red-600 hover:bg-red-700 px-3 py-2 rounded-md text-base font-semibold shadow transition"
          >
            <span class="text-white">Sair</span>
          </button>
        </div>
      </div>
    </nav>

    <main class="flex-1 p-6 bg-white">
      <div class="w-full">
        <!-- Conteúdo do Dashboard e Gráfico - Renderizado apenas na rota /home -->
        <div v-if="currentRoute.path === '/home'">
          <h1 class="text-3xl font-bold mb-6 text-gray-800">Dashboard</h1>

          <!-- Filtros para o gráfico -->
          <div class="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:gap-x-4">
            <div class="flex flex-col sm:flex-row gap-x-2 space-y-2 sm:space-y-0 w-full sm:w-auto">
              <div>
                <label for="chartFilterCompany" class="sr-only">Filtrar Gráfico por Empresa</label>
                <select
                  id="chartFilterCompany"
                  v-model.number="chartSelectedCompanyId"
                  class="border px-4 py-2 rounded w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Todas as Empresas</option>
                  <option v-for="company in companies" :key="company.id" :value="company.id">
                    {{ company.name }}
                  </option>
                </select>
              </div>
              <div>
                <label for="chartFilterProject" class="sr-only">Filtrar Gráfico por Projeto</label>
                <select
                  id="chartFilterProject"
                  v-model.number="chartSelectedProjectId"
                  class="border px-4 py-2 rounded w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  :disabled="!chartSelectedCompanyId && filteredChartProjectOptions.length === 0"
                >
                  <option value="">Todos os Projetos</option>
                  <option v-for="project in filteredChartProjectOptions" :key="project.id" :value="project.id">
                    {{ project.name }}
                  </option>
                </select>
              </div>
            </div>
            <!-- Campo de Pesquisa Removido -->
          </div>

          <!-- Div explícita para criar o espaçamento entre o bloco superior (filtros) e o gráfico -->
          <div class="h-6"></div> <!-- h-6 no Tailwind CSS corresponde a 1.5rem ou 24px de altura -->

          <!-- Gráfico de Barras para Resumo de Tokens -->
          <div class="bg-white rounded-lg p-6 shadow-md mb-6">
            <h3 class="text-xl font-semibold mb-4 text-gray-800">Tokens por Período, Empresa e Projeto</h3>
            <div v-if="chartData.datasets.length > 0">
              <Bar
                id="token-summary-chart"
                :options="chartOptions"
                :data="chartData"
              />
            </div>
            <div v-else class="text-center text-gray-500 py-8">
              Carregando dados do gráfico ou nenhum dado disponível.
            </div>
          </div>

          <!-- NOVO: Componente de Exibição de Logs -->
          <LogDisplay />

        </div>

        <!-- O router-view carregará o conteúdo específico da rota abaixo do dashboard fixo (se estiver na rota /home) ou como conteúdo principal nas outras rotas -->
        <router-view />
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router';
import axios from 'axios';
import { ref, onMounted, computed, watch } from 'vue';
import { Bar } from 'vue-chartjs';
import { Chart as ChartJS, Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale } from 'chart.js';
import { getTokensSummary } from '@/services/messageService';
import { getCompanies } from '@/services/companyService';
import { getProjects } from '@/services/projectService';
import LogDisplay from '@/components/LogDisplay.vue'; // Importa o novo componente de logs

const router = useRouter();
const currentRoute = useRoute(); // Instância da rota atual

const logout = () => {
  localStorage.removeItem('jwt_token');
  if (axios.defaults.headers.common['Authorization']) {
    delete axios.defaults.headers.common['Authorization'];
  }
  router.push('/login');
};

// --- Dados e Opções do Gráfico ---
const chartData = ref({
  labels: [],
  datasets: []
});

const chartOptions = ref({
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'top',
    },
    title: {
      display: true,
      text: 'Total de Tokens por Período'
    }
  },
  scales: {
    x: {
      title: {
        display: true,
        text: 'Período (Ano-Mês)'
      }
    },
    y: {
      title: {
        display: true,
        text: 'Total de Tokens (Caracteres)'
      },
      beginAtZero: true
    }
  }
});

// --- Variáveis Reativas para os Filtros do Gráfico ---
const companies = ref([]);
const projects = ref([]);
const chartSelectedCompanyId = ref('');
const chartSelectedProjectId = ref('');

// Registra os componentes necessários do Chart.js
ChartJS.register(Title, Tooltip, Legend, BarElement, CategoryScale, LinearScale);

// --- Funções e Propriedades Computadas para o Gráfico ---

const fetchChartFilterOptions = async () => {
  try {
    companies.value = await getCompanies();
    projects.value = await getProjects();
  } catch (error) {
    console.error("Erro ao carregar opções de filtro para o gráfico:", error);
  }
};

const filteredChartProjectOptions = computed(() => {
  if (!chartSelectedCompanyId.value) {
    return projects.value;
  }
  return projects.value.filter(p => p.company_id === chartSelectedCompanyId.value);
});

const fetchChartData = async () => {
  try {
    const rawData = await getTokensSummary(chartSelectedCompanyId.value, chartSelectedProjectId.value);

    const aggregatedData = {};
    rawData.forEach(item => {
      const date = new Date(item.created_at);
      const yearMonth = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;

      if (!aggregatedData[yearMonth]) {
        aggregatedData[yearMonth] = { totalTokens: 0 };
      }
      aggregatedData[yearMonth].totalTokens += item.message ? item.message.length : 0;
    });

    const labels = Object.keys(aggregatedData).sort();
    const dataValues = labels.map(label => aggregatedData[label].totalTokens);

    chartData.value = {
      labels: labels,
      datasets: [
        {
          label: 'Total de Tokens',
          backgroundColor: '#42A5F5',
          data: dataValues
        }
      ]
    };

    let titleText = 'Total de Tokens por Período';
    const selectedCompany = companies.value.find(c => c.id === chartSelectedCompanyId.value);
    const selectedProject = projects.value.find(p => p.id === chartSelectedProjectId.value);

    if (selectedCompany) {
      titleText += ` - Empresa: ${selectedCompany.name}`;
    }
    if (selectedProject) {
      titleText += ` - Projeto: ${selectedProject.name}`;
    }
    chartOptions.value.plugins.title.text = titleText;

  } catch (error) {
    console.error("Erro ao carregar dados do gráfico:", error);
    chartData.value = { labels: [], datasets: [] };
  }
};

// Watchers para re-buscar dados do gráfico quando os filtros mudam
watch([chartSelectedCompanyId, chartSelectedProjectId], () => {
  fetchChartData();
});

// Carrega as opções de filtro e os dados do gráfico ao montar o componente
onMounted(async () => {
  // Apenas busca dados do gráfico se a rota atual for /home
  if (currentRoute.path === '/home') {
    await fetchChartFilterOptions();
    fetchChartData();
  }
});

// Watcher para a rota: se a rota mudar para /home, carrega os dados do gráfico
watch(() => currentRoute.path, (newPath) => {
  if (newPath === '/home') {
    fetchChartFilterOptions();
    fetchChartData();
  }
});
</script>

<style scoped>
/* Estilos específicos para este componente, se necessário */
</style>
