<template>
  <div class="p-6">
    <!-- Bloco superior contendo a pesquisa e os botões de ação -->
    <!-- Removido mb-6 daqui para controlar o espaçamento com o div h-6 -->
    <div class="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:gap-x-4">
      <div class="flex w-full sm:w-1/2 lg:w-1/3 items-center gap-x-2">
        <input
          v-model="searchInput"
          placeholder="Pesquisar usuário..."
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
          :disabled="!selectedUser"
          @click="openModal(selectedUser)"
          class="bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition-colors duration-200
                           disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
        >
          Editar
        </button>
        <button
          :disabled="!selectedUser"
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
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Empresa</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Função</th>
            <th class="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Responsável</th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-if="paginatedUsersWithCompanyNames.length === 0">
            <td colspan="5" class="px-4 py-4 whitespace-nowrap text-sm text-gray-500 text-center">Nenhum usuário encontrado.</td>
          </tr>
          <tr
            v-for="user in paginatedUsersWithCompanyNames"
            :key="user.id"
            :class="{ 'bg-blue-50 border-l-4 border-blue-600': selectedUser?.id === user.id }"
            @click="selectUser(user)"
            class="cursor-pointer hover:bg-gray-50 transition-colors duration-150"
          >
            <td class="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">{{ user.name }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{{ user.email }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{{ user.company_name || 'N/A' }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{{ user.role }}</td>
            <td class="px-4 py-3 whitespace-nowrap text-sm text-gray-700">{{ user.is_responsible ? 'Sim' : 'Não' }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <Pagination
      v-model:currentPage="currentPage"
      :totalPages="totalPages"
      :maxVisibleButtons="7"
    />

    <UserModal :show="modalVisible" :user="selectedToEdit" @close="closeModal" @saved="fetchUsers" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import UserModal from '@/components/UserModal.vue';
import Pagination from '@/components/Pagination.vue';
import { getUsers, deleteUser } from '@/services/userService';
import { getCompanies } from '@/services/companyService'; // Importe o serviço de empresas

const users = ref([]);
const companies = ref([]); // Novo ref para armazenar as empresas
const selectedUser = ref(null);
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
    selectedUser.value = null;
    currentPage.value = 1;
  } catch (error) {
    console.error("Erro ao buscar usuários:", error);
    alert('Erro ao carregar a lista de usuários. Por favor, tente novamente.');
  }
};

// Propriedade computada para adicionar o nome da empresa a cada usuário
const usersWithCompanyNames = computed(() => {
  if (users.value.length === 0 || companies.value.length === 0) {
    return [];
  }
  return users.value.map(user => {
    const company = companies.value.find(c => c.id === user.company_id);
    return {
      ...user,
      company_name: company ? company.name : 'Empresa Desconhecida'
    };
  });
});

// A propriedade computada 'filteredUsers' agora filtra 'usersWithCompanyNames'
const filteredUsers = computed(() => {
  if (!confirmedSearchTerm.value) {
    return usersWithCompanyNames.value; // Usa a lista com nomes de empresa
  }
  const searchTerm = confirmedSearchTerm.value.toLowerCase();
  return usersWithCompanyNames.value.filter(u => // Filtra a lista com nomes de empresa
    u.name?.toLowerCase().includes(searchTerm) ||
    u.email?.toLowerCase().includes(searchTerm) ||
    u.role?.toLowerCase().includes(searchTerm) ||
    u.company_name?.toLowerCase().includes(searchTerm) || // Pesquisa pelo nome da empresa
    u.company_id?.toString().includes(searchTerm) // Mantém a pesquisa por ID se necessário
  );
});

// Resto do script (totalPages, paginatedUsers, openModal, closeModal, deleteSelected, selectUser)
// permanece o mesmo, mas 'paginatedUsers' deve usar 'filteredUsers'
const totalPages = computed(() =>
  Math.ceil(filteredUsers.value.length / itemsPerPage)
);

const paginatedUsersWithCompanyNames = computed(() => {
  const startIndex = (currentPage.value - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  return filteredUsers.value.slice(startIndex, endIndex);
});


const performSearch = () => {
  confirmedSearchTerm.value = searchInput.value;
  currentPage.value = 1;
};

const openModal = (user = null) => {
  selectedToEdit.value = user ? { ...user } : null;
  modalVisible.value = true;
};

const closeModal = () => {
  modalVisible.value = false;
};

const deleteSelected = async () => {
  if (selectedUser.value?.id) {
    if (confirm(`Tem certeza que deseja remover o usuário "${selectedUser.value.name}"?`)) {
      try {
        await deleteUser(selectedUser.value.id);
        fetchUsers();
        alert('Usuário removido com sucesso!');
      } catch (error) {
        console.error("Erro ao remover usuário:", error);
        alert('Erro ao remover usuário. Verifique se ele não possui vínculos.');
      }
    }
  }
};

const selectUser = (user) => {
  selectedUser.value = user;
};


// Carregar empresas e usuários quando o componente for montado
onMounted(async () => {
  await fetchCompanies(); // Primeiro carrega as empresas
  await fetchUsers();     // Depois carrega os usuários
});
</script>

<style scoped>
/* Estilos específicos para este componente, se necessário */
</style>
