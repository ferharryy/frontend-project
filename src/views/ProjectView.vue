<template>
  <div class="p-6">
    <!-- Bloco superior contendo a pesquisa e os botões de ação -->
    <!-- Removido mb-6 daqui para controlar o espaçamento com o div h-6 -->
    <div class="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:gap-x-4">
      <div class="flex w-full sm:w-1/2 lg:w-1/3 items-center gap-x-2">
        <input
          v-model="searchInput"
          placeholder="Pesquisar projeto..."
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
          :disabled="!selectedProject"
          @click="openModal(selectedProject)"
          class="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors duration-200
                           disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          Editar
        </button>
        <button
          :disabled="!selectedProject"
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
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Chave</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuário Resp.</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="paginatedProjectsWithNames.length === 0">
            <td colspan="4" class="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">Nenhum projeto encontrado.</td>
          </tr>
          <tr
            v-for="project in paginatedProjectsWithNames"
            :key="project.id"
            :class="{ 'bg-blue-50 border-l-4 border-blue-600': selectedProject?.id === project.id }"
            @click="selectProject(project)"
            class="cursor-pointer hover:bg-gray-50 transition-colors duration-150"
          >
            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{{ project.name }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{{ project.key }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{{ project.company_name || 'N/A' }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{{ project.user_name || 'N/A' }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  
    <Pagination
      v-model:currentPage="currentPage"
      :totalPages="totalPages"
      :maxVisibleButtons="7"
    />
  
    <ProjectModal :show="modalVisible" :project="selectedToEdit" @close="closeModal" @saved="fetchProjects" />
  </div>
</template>
  
<script setup>
import { ref, computed, onMounted } from 'vue';
import ProjectModal from '@/components/ProjectModal.vue'; // Importa a nova modal de projeto
import Pagination from '@/components/Pagination.vue';
import { getProjects, deleteProject } from '@/services/projectService'; // Importa o serviço de projeto
import { getCompanies } from '@/services/companyService'; // Para buscar nomes de empresas
import { getUsers } from '@/services/userService'; // Para buscar nomes de usuários

const projects = ref([]);
const companies = ref([]); // Lista de empresas para mapear nomes
const users = ref([]);     // Lista de usuários para mapear nomes

const selectedProject = ref(null);
const modalVisible = ref(false);
const selectedToEdit = ref(null);

const searchInput = ref('');
const confirmedSearchTerm = ref('');

const currentPage = ref(1);
const itemsPerPage = 10;

// Função para buscar as empresas
const fetchCompanies = async () => {
  try {
    companies.value = await getCompanies();
  } catch (error) {
    console.error("Erro ao buscar empresas:", error);
    alert('Erro ao carregar a lista de empresas. Por favor, recarregue a página.');
  }
};

// Função para buscar os usuários
const fetchUsers = async () => {
  try {
    users.value = await getUsers();
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    alert('Erro ao carregar a lista de usuários. Por favor, recarregue a página.');
  }
};

// Função para buscar os projetos
const fetchProjects = async () => {
  try {
    projects.value = await getProjects();
    selectedProject.value = null; // Limpa seleção ao recarregar
    currentPage.value = 1; // Reseta para a primeira página
  } catch (error) {
    console.error("Erro ao buscar projetos:", error);
    alert('Erro ao carregar a lista de projetos. Por favor, tente novamente.');
  }
};

// Propriedade computada para adicionar os nomes de empresa e usuário a cada projeto
const projectsWithNames = computed(() => {
  if (projects.value.length === 0) {
    return [];
  }
  // Garante que companies e users estão carregados antes de tentar mapear
  if (companies.value.length === 0 && users.value.length === 0) {
      return projects.value.map(project => ({
          ...project,
          company_name: 'Carregando...',
          user_name: 'Carregando...'
      }));
  }

  return projects.value.map(project => {
    const company = companies.value.find(c => c.id === project.company_id);
    const user = users.value.find(u => u.id === project.user_id);
    return {
      ...project,
      company_name: company ? company.name : 'Empresa Desconhecida',
      user_name: user ? user.name : 'Usuário Desconhecido'
    };
  });
});

// A propriedade computada 'filteredProjects' agora filtra 'projectsWithNames'
const filteredProjects = computed(() => {
  if (!confirmedSearchTerm.value) {
    return projectsWithNames.value;
  }
  const searchTerm = confirmedSearchTerm.value.toLowerCase();
  return projectsWithNames.value.filter(p =>
    p.name?.toLowerCase().includes(searchTerm) ||
    p.key?.toLowerCase().includes(searchTerm) ||
    p.company_name?.toLowerCase().includes(searchTerm) || // Pesquisa pelo nome da empresa
    p.user_name?.toLowerCase().includes(searchTerm) // Pesquisa pelo nome do usuário
  );
});

// Propriedade computada para o total de páginas
const totalPages = computed(() =>
  Math.ceil(filteredProjects.value.length / itemsPerPage)
);

// Propriedade computada para os projetos da página atual
const paginatedProjectsWithNames = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return filteredProjects.value.slice(startIndex, endIndex);
});

const performSearch = () => {
  confirmedSearchTerm.value = searchInput.value;
  currentPage.value = 1;
};

const openModal = (project = null) => {
  selectedToEdit.value = project ? { ...project } : null;
  modalVisible.value = true;
};

const closeModal = () => {
  modalVisible.value = false;
};

const deleteSelected = async () => {
  if (selectedProject.value?.id) {
    if (confirm(`Tem certeza que deseja remover o projeto "${selectedProject.value.name}"?`)) {
      try {
        await deleteProject(selectedProject.value.id);
        fetchProjects(); // Recarrega a lista após a exclusão
        alert('Projeto removido com sucesso!'); // Feedback visual
      } catch (error) {
        console.error("Erro ao remover projeto:", error);
        alert('Erro ao remover projeto. Verifique se ele não possui vínculos.');
      }
    }
  }
};

const selectProject = (project) => {
  selectedProject.value = project;
};

// Carregar empresas, usuários e projetos quando o componente for montado
onMounted(async () => {
  await fetchCompanies(); // Primeiro carrega as empresas
  await fetchUsers();     // Depois carrega os usuários
  await fetchProjects();  // Por último, carrega os projetos
});
</script>

<style scoped>
/* Estilos específicos para este componente, se necessário */
</style>
