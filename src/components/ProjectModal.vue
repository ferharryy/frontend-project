<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-xl relative shadow-lg">
      <h2 class="text-xl font-semibold mb-4">{{ form.id ? 'Editar Projeto' : 'Novo Projeto' }}</h2>

      <!-- O alerta de sucesso foi removido daqui, pois o toast o substituirá -->

      <form @submit.prevent="save">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label for="projectName" class="block text-sm font-medium text-gray-700">Nome do Projeto <span class="text-red-500">*</span></label>
            <input id="projectName" v-model="form.name" placeholder="Nome do Projeto" class="border p-2 rounded w-full" :class="{ 'border-red-500': errors.name }" />
            <p v-if="errors.name" class="text-red-500 text-xs mt-1">{{ errors.name }}</p>
          </div>

          <div>
            <label for="projectKey" class="block text-sm font-medium text-gray-700">Chave do Projeto <span class="text-red-500">*</span></label>
            <input id="projectKey" v-model="form.key" placeholder="Chave Única do Projeto" class="border p-2 rounded w-full" :class="{ 'border-red-500': errors.key }" />
            <p v-if="errors.key" class="text-red-500 text-xs mt-1">{{ errors.key }}</p>
          </div>

          <div>
            <label for="companyId" class="block text-sm font-medium text-gray-700">Empresa <span class="text-red-500">*</span></label>
            <select id="companyId" v-model.number="form.company_id" class="border p-2 rounded w-full" :class="{ 'border-red-500': errors.company_id }">
              <option value="">Selecione uma empresa</option>
              <option v-for="company in companyOptions" :key="company.id" :value="company.id">
                {{ company.name }}
              </option>
            </select>
            <p v-if="errors.company_id" class="text-red-500 text-xs mt-1">{{ errors.company_id }}</p>
          </div>

          <div>
            <label for="userId" class="block text-sm font-medium text-gray-700">Usuário Responsável <span class="text-red-500">*</span></label>
            <select id="userId" v-model.number="form.user_id" class="border p-2 rounded w-full" :class="{ 'border-red-500': errors.user_id }">
              <option value="">Selecione um usuário</option>
              <option v-for="user in userOptions" :key="user.id" :value="user.id">
                {{ user.name }}
              </option>
            </select>
            <p v-if="errors.user_id" class="text-red-500 text-xs mt-1">{{ errors.user_id }}</p>
          </div>
        </div>

        <!-- Div explícita para criar o espaçamento entre os campos e os botões -->
        <div class="h-6"></div> <!-- h-6 no Tailwind CSS corresponde a 1.5rem ou 24px de altura -->

        <div class="flex justify-end mt-6 space-x-2 gap-3">
          <button type="button" @click="$emit('close')" class="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors duration-200">Cancelar</button>
          <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200">
            {{ isSaving ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits, onMounted, inject } from 'vue'; // Adicionado 'inject'
import { createProject, updateProject } from '@/services/projectService';
import { getCompanies } from '@/services/companyService';
import { getUsers } from '@/services/userService';

const toast = inject('toast'); // Injeta a função toast

const props = defineProps({
  show: Boolean,
  project: Object
});

const emit = defineEmits(['close', 'saved']);

const form = ref({
  id: null,
  name: '',
  key: '',
  user_id: null,
  company_id: null,
});

const errors = ref({});
// const showSuccessAlert = ref(false); // Removido, pois o toast o substituirá
const isSaving = ref(false);

const companyOptions = ref([]);
const userOptions = ref([]);

// Carrega as opções de empresas e usuários ao montar o componente
onMounted(async () => {
  try {
    companyOptions.value = await getCompanies();
    userOptions.value = await getUsers();
  } catch (error) {
    console.error('Erro ao carregar opções de empresas/usuários:', error);
    toast?.show('Erro ao carregar opções de seleção.', 'error'); // Usando toast
  }
});

// Watcher para preencher o formulário quando o prop 'project' mudar
watch(() => props.project, (value) => {
  // Resetar o formulário
  form.value = {
    id: null,
    name: '',
    key: '',
    user_id: null,
    company_id: null,
  };

  // Se houver um projeto para editar, preencha o formulário
  if (value && value.id) {
    Object.assign(form.value, value);
  }

  errors.value = {};
  // showSuccessAlert.value = false; // Removido
}, { immediate: true });

// --- Funções de Validação ---
const validateForm = () => {
  errors.value = {};

  if (!form.value.name || form.value.name.trim() === '') {
    errors.value.name = 'Nome do Projeto é obrigatório.';
  }
  if (!form.value.key || form.value.key.trim() === '') {
    errors.value.key = 'Chave do Projeto é obrigatória.';
  }
  if (form.value.user_id === null || form.value.user_id === '') {
    errors.value.user_id = 'Usuário responsável é obrigatório.';
  } else if (typeof form.value.user_id !== 'number' || form.value.user_id <= 0) {
    errors.value.user_id = 'Usuário responsável inválido.';
  }
  if (form.value.company_id === null || form.value.company_id === '') {
    errors.value.company_id = 'Empresa é obrigatória.';
  } else if (typeof form.value.company_id !== 'number' || form.value.company_id <= 0) {
    errors.value.company_id = 'Empresa inválida.';
  }

  return Object.keys(errors.value).length === 0;
};

// --- Função Salvar ---
const save = async () => {
  if (!validateForm()) {
    return;
  }

  isSaving.value = true;
  // showSuccessAlert.value = false; // Removido

  let payload = {
    name: form.value.name,
    key: form.value.key,
    user_id: form.value.user_id,
    company_id: form.value.company_id,
  };

  try {
    if (form.value.id) {
      await updateProject(form.value.id, payload);
      toast?.show('Projeto atualizado com sucesso!', 'success'); // Usando toast
    } else {
      await createProject(payload);
      toast?.show('Projeto criado com sucesso!', 'success'); // Usando toast
    }

    // showSuccessAlert.value = true; // Removido

    // O setTimeout é ajustado para apenas fechar o modal
    setTimeout(() => {
      emit('close');
      emit('saved');
      // showSuccessAlert.value = false; // Removido
    }, 500); // Um pequeno delay para o toast ser visível antes do modal fechar

  } catch (error) {
    console.error('Erro ao salvar projeto:', error);
    let errorMessageText = 'Ocorreu um erro ao salvar o projeto. Por favor, tente novamente.';
    if (error.response && error.response.data && error.response.data.message) {
      errorMessageText = error.response.data.message;
    } else if (error.message) {
      errorMessageText = error.message;
    }
    toast?.show('Erro ao salvar o projeto: ' + errorMessageText, 'error'); // Usando toast
  } finally {
    isSaving.value = false;
  }
};
</script>

<style scoped>
/* Estilos específicos para este componente, se necessário */
</style>
