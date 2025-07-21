<template>
  <div class="p-6">
    <!-- Bloco superior contendo a pesquisa e os botões de ação -->
    <div class="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:gap-x-4">
      <div class="flex w-full sm:w-1/2 lg:w-1/3 items-center gap-x-2">
        <input
          v-model="searchInput"
          placeholder="Pesquisar empresa..."
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

      <div class="flex flex-col sm:flex-row flex-wrap gap-3 mt-3 sm:mt-0">
        <button
          @click="openModal()"
          class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200 whitespace-nowrap"
        >
          Adicionar
        </button>
        <button
          :disabled="!selectedCompany"
          @click="openModal(selectedCompany)"
          class="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors duration-200
                           disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          Editar
        </button>
        <button
          :disabled="!selectedCompany"
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

    <!-- Tabela de empresas -->
    <div class="overflow-x-auto rounded-lg shadow-sm border border-gray-200 mb-6">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-100">
          <tr>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CNPJ</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cidade</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="paginatedCompanies.length === 0">
            <td colspan="4" class="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">Nenhuma empresa encontrada.</td>
          </tr>
          <tr
            v-for="company in paginatedCompanies"
            :key="company.id"
            :class="{ 'bg-blue-50 border-l-4 border-blue-600': selectedCompany?.id === company.id }"
            @click="selectCompany(company)"
            class="cursor-pointer hover:bg-gray-50 transition-colors duration-150"
          >
            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{{ company.name }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{{ company.cnpj }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{{ company.city }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{{ company.state }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <Pagination
      v-model:currentPage="currentPage"
      :totalPages="totalPages"
      :maxVisibleButtons="7"
    />

    <CompanyModal :show="modalVisible" :company="selectedToEdit" @close="closeModal" @saved="fetchCompanies" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import CompanyModal from '@/components/CompanyModal.vue';
import Pagination from '@/components/Pagination.vue';
import { getCompanies, deleteCompany } from '@/services/companyService';

const companies = ref([]);
const selectedCompany = ref(null);
const modalVisible = ref(false);
const selectedToEdit = ref(null);

const searchInput = ref('');
const confirmedSearchTerm = ref('');

const currentPage = ref(1);
const itemsPerPage = 10;

const fetchCompanies = async () => {
  try {
    companies.value = await getCompanies();
    selectedCompany.value = null;
    currentPage.value = 1;
  } catch (error) {
    console.error("Erro ao buscar empresas:", error);
    alert('Erro ao carregar a lista de empresas. Por favor, tente novamente.');
  }
};

const performSearch = () => {
  confirmedSearchTerm.value = searchInput.value;
  currentPage.value = 1;
};

const openModal = (company = null) => {
  selectedToEdit.value = company ? { ...company } : null;
  modalVisible.value = true;
};

const closeModal = () => {
  modalVisible.value = false;
};

const deleteSelected = async () => {
  if (selectedCompany.value?.id) {
    if (confirm(`Tem certeza que deseja remover a empresa "${selectedCompany.value.name}"?`)) {
      try {
        await deleteCompany(selectedCompany.value.id);
        fetchCompanies();
        alert('Empresa removida com sucesso!');
      } catch (error) {
        console.error("Erro ao remover empresa:", error);
        alert('Erro ao remover empresa. Verifique se ela não possui vínculos.');
      }
    }
  }
};

const selectCompany = (company) => {
  selectedCompany.value = company;
};

const filteredCompanies = computed(() => {
  if (!confirmedSearchTerm.value) {
    return companies.value;
  }
  const searchTerm = confirmedSearchTerm.value.toLowerCase();
  return companies.value.filter(c =>
    c.name?.toLowerCase().includes(searchTerm) ||
    c.cnpj?.toLowerCase().includes(searchTerm) ||
    c.city?.toLowerCase().includes(searchTerm) ||
    c.state?.toLowerCase().includes(searchTerm)
  );
});

const totalPages = computed(() =>
  Math.ceil(filteredCompanies.value.length / itemsPerPage)
);

const paginatedCompanies = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return filteredCompanies.value.slice(startIndex, endIndex);
});

onMounted(fetchCompanies);
</script>

<style scoped>
/* Estilos específicos para este componente, se necessário */
</style>
