<template>
  <div class="p-6">
    <!-- Bloco superior contendo os campos de filtro, pesquisa e botões de ação -->
    <!-- Removido mb-6 daqui para controlar o espaçamento com o div h-6 -->
    <div class="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:gap-x-4">
      <!-- NOVOS CAMPOS DE FILTRO: Empresa e Projeto -->
      <div class="flex flex-col sm:flex-row gap-x-2 space-y-2 sm:space-y-0 w-full sm:w-auto">
        <div>
          <label for="filterCompany" class="sr-only">Filtrar por Empresa</label>
          <select
            id="filterCompany"
            v-model.number="selectedCompanyId"
            class="border px-4 py-2 rounded w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Todas as Empresas</option>
            <option v-for="company in companies" :key="company.id" :value="company.id">
              {{ company.name }}
            </option>
          </select>
        </div>
        <div>
          <label for="filterProject" class="sr-only">Filtrar por Projeto</label>
          <select
            id="filterProject"
            v-model.number="selectedProjectId"
            class="border px-4 py-2 rounded w-full sm:w-48 focus:outline-none focus:ring-2 focus:ring-blue-500"
            :disabled="!selectedCompanyId && filteredProjectOptions.length === 0"
          >
            <option value="">Todos os Projetos</option>
            <option v-for="project in filteredProjectOptions" :key="project.id" :value="project.id">
              {{ project.name }}
            </option>
          </select>
        </div>
      </div>

      <!-- Campo de Pesquisa Existente -->
      <div class="flex w-full sm:w-1/2 lg:w-1/3 items-center gap-x-2">
        <input
          v-model="searchInput"
          placeholder="Pesquisar fluxo..."
          class="border px-4 py-2 rounded flex-grow focus:outline-none focus:ring-2 focus:ring-blue-500"
          @keyup.enter="performSearch"
        />
        <button
          @click="performSearch"
          class="bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600 transition-colors duration-200"
          title="Pesquisar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>

      <!-- Ajuste aqui: flex-wrap e gap-3 para espaçamento entre botões -->
      <div class="flex flex-col sm:flex-row flex-wrap gap-3 mt-3 sm:mt-0">
        <button
          @click="openModal()"
          class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 whitespace-nowrap"
        >
          Adicionar
        </button>
        <button
          :disabled="!selectedFlow"
          @click="openModal(selectedFlow)"
          class="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors duration-200
                           disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          Editar
        </button>
        <button
          :disabled="!selectedFlow"
          @click="deleteSelected"
          class="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors duration-200
                           disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          Remover
        </button>
      </div>
    </div>

    <!-- Div explícita para criar o espaçamento entre o bloco superior e a tabela -->
    <div class="h-6"></div> <!-- h-6 no Tailwind CSS corresponde a 1.5rem ou 24px de altura -->

    <div class="overflow-x-auto rounded-lg shadow-sm border border-gray-200 mb-6">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-100">
          <tr>
            <!-- Nova ordem dos campos na grid: Interação, Ordem, Final, Prompt -->
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Interação</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ordem</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Final</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Prompt</th>
            <!-- Campos Empresa e Projeto removidos da grid -->
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="paginatedFlowsWithNames.length === 0">
            <!-- Colspan ajustado para 4 colunas -->
            <td colspan="4" class="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">Nenhum fluxo encontrado.</td>
          </tr>
          <tr
            v-for="flow in paginatedFlowsWithNames"
            :key="flow.id"
            :class="{ 'bg-blue-50 border-l-4 border-blue-600': selectedFlow?.id === flow.id }"
            @click="selectFlow(flow)"
            class="cursor-pointer hover:bg-gray-50 transition-colors duration-150"
          >
            <!-- Nova ordem dos campos na grid -->
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{{ flow.interaction }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{{ flow.interaction_order }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{{ flow.is_final ? 'Sim' : 'Não' }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{{ flow.prompt }}</td>
            <!-- Campos Empresa e Projeto removidos da grid -->
          </tr>
        </tbody>
      </table>
    </div>

    <Pagination
      v-model:currentPage="currentPage"
      :totalPages="totalPages"
      :maxVisibleButtons="7"
    />

    <MessageProcessingModal :show="modalVisible" :flow="selectedToEdit" @close="closeModal" @saved="fetchFlowsAndRelatedData" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import MessageProcessingModal from '@/components/MessageProcessingModal.vue';
import Pagination from '@/components/Pagination.vue';
import { getMessageProcessing, deleteMessageProcessing } from '@/services/messageProcessingService';
import { getCompanies } from '@/services/companyService'; // Para buscar nomes de empresas
import { getProjects } from '@/services/projectService';   // Para buscar nomes de projetos

const flows = ref([]);
const companies = ref([]); // Lista de empresas para mapear nomes
const projects = ref([]);   // Lista de projetos para mapear nomes

const selectedFlow = ref(null);
const modalVisible = ref(false);
const selectedToEdit = ref(null);

const searchInput = ref('');
const confirmedSearchTerm = ref('');

const currentPage = ref(1);
const itemsPerPage = 10;

// NOVOS REFS para os filtros de Empresa e Projeto, usando os nomes corretos do DB
const selectedCompanyId = ref(''); // Vazio para "Todas as Empresas"
const selectedProjectId = ref(''); // Vazio para "Todos os Projetos"

// Função para buscar as empresas
const fetchCompanies = async () => {
  try {
    companies.value = await getCompanies();
  } catch (error) {
    console.error("Erro ao buscar empresas:", error);
    alert('Erro ao carregar a lista de empresas. Por favor, recarregue a página.');
  }
};

// Função para buscar os projetos
const fetchProjects = async () => {
  try {
    projects.value = await getProjects();
  } catch (error) {
    console.error("Erro ao buscar projetos:", error);
    alert('Erro ao carregar a lista de projetos. Por favor, recarregue a página.');
  }
};

// Função para buscar os fluxos
const fetchFlows = async () => {
  try {
    flows.value = await getMessageProcessing();
    selectedFlow.value = null; // Limpa seleção ao recarregar
    currentPage.value = 1; // Reseta para a primeira página
  } catch (error) {
    console.error("Erro ao buscar fluxos:", error);
    alert('Erro ao carregar a lista de fluxos. Por favor, tente novamente.');
  }
};

// Função para buscar todos os dados relacionados (empresas, projetos, fluxos)
const fetchFlowsAndRelatedData = async () => {
  // Busca empresas e projetos em paralelo
  await Promise.all([
    fetchCompanies(),
    fetchProjects()
  ]);
  // Depois busca os fluxos
  await fetchFlows();
};

// Propriedade computada para filtrar projetos com base na empresa selecionada
const filteredProjectOptions = computed(() => {
  if (!selectedCompanyId.value) {
    return projects.value; // Se nenhuma empresa selecionada, mostra todos os projetos
  }
  // CORREÇÃO AQUI: Usa 'company_id' que é o nome da coluna na tabela 'project'
  return projects.value.filter(p => p.company_id === selectedCompanyId.value);
});

// Watcher para resetar o projeto selecionado quando a empresa muda
watch(selectedCompanyId, (newCompanyId) => {
  selectedProjectId.value = ''; // Reseta o projeto selecionado
});

// Propriedade computada para adicionar os nomes de empresa e projeto a cada fluxo
const flowsWithNames = computed(() => {
  if (flows.value.length === 0) {
    return [];
  }
  // Garante que companies e projects estão carregados antes de tentar mapear
  if (companies.value.length === 0 || projects.value.length === 0) {
      return flows.value.map(flow => ({
          ...flow,
          company_name: 'Carregando...',
          project_name: 'Carregando...'
      }));
  }

  return flows.value.map(flow => {
    // Usa os nomes de coluna corretos para a tabela 'message_processing': id_company e id_project
    const company = companies.value.find(c => c.id === flow.id_company);
    const project = projects.value.find(p => p.id === flow.id_project);
    return {
      ...flow,
      company_name: company ? company.name : 'Empresa Desconhecida',
      project_name: project ? project.name : 'Projeto Desconhecido'
    };
  });
});

// A propriedade computada 'filteredFlows' agora filtra 'flowsWithNames' pelos dropdowns E pesquisa
const filteredFlows = computed(() => {
  let currentFlows = flowsWithNames.value;

  // 1. Filtrar por Empresa selecionada (usando o nome da coluna correto para message_processing: id_company)
  if (selectedCompanyId.value) {
    currentFlows = currentFlows.filter(f => f.id_company === selectedCompanyId.value);
  }

  // 2. Filtrar por Projeto selecionado (após filtrar por empresa, usando o nome da coluna correto para message_processing: id_project)
  if (selectedProjectId.value) {
    currentFlows = currentFlows.filter(f => f.id_project === selectedProjectId.value);
  }

  // 3. Aplicar filtro de pesquisa (se houver termo de pesquisa confirmado)
  if (confirmedSearchTerm.value) {
    const searchTerm = confirmedSearchTerm.value.toLowerCase();
    currentFlows = currentFlows.filter(f =>
      f.prompt?.toLowerCase().includes(searchTerm) ||
      f.interaction?.toString().includes(searchTerm) ||
      f.interaction_order?.toString().includes(searchTerm) ||
      f.company_name?.toLowerCase().includes(searchTerm) || // Pesquisa pelo nome da empresa
      f.project_name?.toLowerCase().includes(searchTerm)    // Pesquisa pelo nome do projeto
    );
  }

  // 4. Ordenar pela interação
  currentFlows.sort((a, b) => {
    // Lida com valores nulos para interação
    if (a.interaction === null && b.interaction === null) return 0;
    if (a.interaction === null) return 1; // Coloca nulls no final
    if (b.interaction === null) return -1; // Coloca nulls no final
    return a.interaction - b.interaction;
  });


  return currentFlows;
});

// Propriedade computada para o total de páginas
const totalPages = computed(() =>
  Math.ceil(filteredFlows.value.length / itemsPerPage)
);

// Propriedade computada para os fluxos da página atual
const paginatedFlowsWithNames = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return filteredFlows.value.slice(startIndex, endIndex);
});

const performSearch = () => {
  confirmedSearchTerm.value = searchInput.value;
  currentPage.value = 1; // Reseta a página ao aplicar nova pesquisa/filtros
};

// Watchers para re-executar a pesquisa quando os filtros de empresa/projeto mudam
watch([selectedCompanyId, selectedProjectId], () => {
  performSearch(); // Re-aplica a pesquisa, que agora inclui os filtros de dropdown
});


const openModal = (flow = null) => {
  selectedToEdit.value = flow ? { ...flow } : null;
  modalVisible.value = true;
};

const closeModal = () => {
  modalVisible.value = false;
};

const deleteSelected = async () => {
  if (selectedFlow.value?.id) {
    if (confirm(`Tem certeza que deseja remover o fluxo com prompt "${selectedFlow.value.prompt}"?`)) {
      try {
        await deleteMessageProcessing(selectedFlow.value.id);
        fetchFlowsAndRelatedData(); // Recarrega tudo após a exclusão
        alert('Fluxo removido com sucesso!');
      } catch (error) {
        console.error("Erro ao remover fluxo:", error);
        alert('Erro ao remover fluxo. Verifique se ele não possui vínculos.');
      }
    }
  }
};

const selectFlow = (flow) => {
  selectedFlow.value = flow;
};

// Carregar empresas, projetos e fluxos quando o componente for montado
onMounted(fetchFlowsAndRelatedData);
</script>

<style scoped>
/* Estilos específicos para este componente, se necessário */
</style>
