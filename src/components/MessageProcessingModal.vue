<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-xl relative shadow-lg">
      <h2 class="text-xl font-semibold mb-4">{{ form.id ? 'Editar Fluxo' : 'Novo Fluxo' }}</h2>

      <!-- O alerta de sucesso foi removido daqui, pois o toast o substituirá -->

      <form @submit.prevent="save">
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="sm:col-span-2">
            <label for="prompt" class="block text-sm font-medium text-gray-700">Prompt <span class="text-red-500">*</span></label>
            <textarea id="prompt" v-model="form.prompt" placeholder="Texto do prompt" rows="3" class="border p-2 rounded w-full" :class="{ 'border-red-500': errors.prompt }"></textarea>
            <p v-if="errors.prompt" class="text-red-500 text-xs mt-1">{{ errors.prompt }}</p>
          </div>

          <div>
            <label for="interaction" class="block text-sm font-medium text-gray-700">Interação <span class="text-red-500">*</span></label>
            <input id="interaction" type="number" v-model.number="form.interaction" placeholder="Número da interação" class="border p-2 rounded w-full" :class="{ 'border-red-500': errors.interaction }" />
            <p v-if="errors.interaction" class="text-red-500 text-xs mt-1">{{ errors.interaction }}</p>
          </div>

          <div>
            <label for="interactionOrder" class="block text-sm font-medium text-gray-700">Ordem da Interação <span class="text-red-500">*</span></label>
            <input id="interactionOrder" type="number" v-model.number="form.interaction_order" placeholder="Ordem dentro da interação" class="border p-2 rounded w-full" :class="{ 'border-red-500': errors.interaction_order }" />
            <p v-if="errors.interaction_order" class="text-red-500 text-xs mt-1">{{ errors.interaction_order }}</p>
          </div>

          <!-- CAMPOS DE SELEÇÃO DE EMPRESA E PROJETO -->
          <div>
            <label for="idCompany" class="block text-sm font-medium text-gray-700">Empresa <span class="text-red-500">*</span></label>
            <select
              id="idCompany"
              v-model.number="form.id_company"
              class="border p-2 rounded w-full"
              :class="{ 'border-red-500': errors.id_company }"
            >
              <option value="">Selecione uma empresa</option>
              <option v-for="company in companyOptions" :key="company.id" :value="company.id">
                {{ company.name }}
              </option>
            </select>
            <p v-if="errors.id_company" class="text-red-500 text-xs mt-1">{{ errors.id_company }}</p>
          </div>

          <div>
            <label for="idProject" class="block text-sm font-medium text-gray-700">Projeto <span class="text-red-500">*</span></label>
            <select
              id="idProject"
              v-model.number="form.id_project"
              class="border p-2 rounded w-full"
              :class="{ 'border-red-500': errors.id_project }"
              :disabled="!form.id_company && filteredProjectOptions.length === 0"
            >
              <option value="">Selecione um projeto</option>
              <option v-for="project in filteredProjectOptions" :key="project.id" :value="project.id">
                {{ project.name }}
              </option>
            </select>
            <p v-if="errors.id_project" class="text-red-500 text-xs mt-1">{{ errors.id_project }}</p>
          </div>

          <div class="col-span-2 flex items-center mt-2">
            <input id="isFinal" type="checkbox" v-model="form.is_final" class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
            <label for="isFinal" class="ml-2 block text-sm text-gray-900">É Final</label>
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
import { ref, watch, defineProps, defineEmits, onMounted, computed, inject } from 'vue'; // Adicionado 'inject'
import { createMessageProcessing, updateMessageProcessing } from '@/services/messageProcessingService';
import { getCompanies } from '@/services/companyService';
import { getProjects } from '@/services/projectService';

const toast = inject('toast'); // Injeta a função toast

const props = defineProps({
  show: Boolean,
  flow: Object
});

const emit = defineEmits(['close', 'saved']);

const form = ref({
  id: null,
  prompt: '',
  interaction: null,
  is_final: false,
  interaction_order: null,
  id_company: null,
  id_project: null,
});

const errors = ref({});
// const showSuccessAlert = ref(false); // Removido, pois o toast o substituirá
const isSaving = ref(false);

const companyOptions = ref([]);
const allProjectOptions = ref([]); // Renomeado para armazenar TODOS os projetos
const userOptions = ref([]); // Embora não usado na modal, é bom ter se for necessário no futuro

// Propriedade computada para filtrar projetos com base na empresa selecionada na modal
const filteredProjectOptions = computed(() => {
  if (!form.value.id_company) {
    return allProjectOptions.value; // Se nenhuma empresa selecionada, mostra todos os projetos
  }
  // Filtra usando 'company_id' que é o nome da coluna na tabela 'project'
  return allProjectOptions.value.filter(p => p.company_id === form.value.id_company);
});

// Carrega as opções de empresas e TODOS os projetos ao montar o componente
onMounted(async () => {
  try {
    companyOptions.value = await getCompanies();
    allProjectOptions.value = await getProjects(); // Carrega todos os projetos
    // userOptions.value = await getUsers(); // Descomente se precisar de usuários na modal
  } catch (error) {
    console.error('Erro ao carregar opções de seleção:', error);
    toast?.show('Erro ao carregar opções de seleção. Recarregue a página.', 'error'); // Usando toast
  }
});

// Watcher para preencher o formulário quando o prop 'flow' mudar
watch(() => props.flow, (value) => {
  // Resetar o formulário
  form.value = {
    id: null,
    prompt: '',
    interaction: null,
    is_final: false,
    interaction_order: null,
    id_company: null,
    id_project: null,
  };

  // Se houver um fluxo para editar, preencha o formulário
  if (value && value.id) {
    Object.assign(form.value, value);
  }

  errors.value = {};
  // showSuccessAlert.value = false; // Removido
}, { immediate: true });

// Watcher para resetar o projeto selecionado quando a empresa muda no formulário da modal
watch(() => form.value.id_company, (newCompanyId) => {
  // Se a empresa mudar e o projeto atual não pertencer à nova empresa, reseta o projeto
  const currentProjectBelongsToNewCompany = filteredProjectOptions.value.some(p => p.id === form.value.id_project);
  if (form.value.id_project && !currentProjectBelongsToNewCompany) {
    form.value.id_project = null;
  } else if (!newCompanyId) { // Se a empresa for desmarcada
    form.value.id_project = null;
  }
});


// --- Funções de Validação ---
const validateForm = () => {
  errors.value = {};

  if (!form.value.prompt || form.value.prompt.trim() === '') {
    errors.value.prompt = 'Prompt é obrigatório.';
  }
  if (form.value.interaction === null || typeof form.value.interaction !== 'number' || form.value.interaction < 0) {
    errors.value.interaction = 'Interação é obrigatória e deve ser um número não negativo.';
  }
  if (form.value.interaction_order === null || typeof form.value.interaction_order !== 'number' || form.value.interaction_order < 0) {
    errors.value.interaction_order = 'Ordem da Interação é obrigatória e deve ser um número não negativo.';
  }
  // Validação para id_company
  if (form.value.id_company === null || form.value.id_company === '') {
    errors.value.id_company = 'Empresa é obrigatória.';
  } else if (typeof form.value.id_company !== 'number' || form.value.id_company <= 0) {
    errors.value.id_company = 'Empresa inválida.';
  }
  // Validação para id_project
  if (form.value.id_project === null || form.value.id_project === '') {
    errors.value.id_project = 'Projeto é obrigatório.';
  } else if (typeof form.value.id_project !== 'number' || form.value.id_project <= 0) {
    errors.value.id_project = 'Projeto inválido.';
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
    prompt: form.value.prompt,
    interaction: form.value.interaction,
    is_final: form.value.is_final,
    interaction_order: form.value.interaction_order,
    id_company: form.value.id_company,
    id_project: form.value.id_project,
  };

  try {
    if (form.value.id) {
      await updateMessageProcessing(form.value.id, payload);
      toast?.show('Fluxo atualizado com sucesso!', 'success'); // Usando toast
    } else {
      await createMessageProcessing(payload);
      toast?.show('Fluxo criado com sucesso!', 'success'); // Usando toast
    }

    // O setTimeout é ajustado para apenas fechar o modal
    setTimeout(() => {
      emit('close');
      emit('saved');
      // showSuccessAlert.value = false; // Removido
    }, 500); // Um pequeno delay para o toast ser visível antes do modal fechar

  } catch (error) {
    console.error('Erro ao salvar fluxo:', error);
    let errorMessageText = 'Ocorreu um erro ao salvar o fluxo. Por favor, tente novamente.';
    if (error.response && error.response.data && error.response.data.message) {
      errorMessageText = error.response.data.data.message; // Acessa a mensagem de erro da resposta do backend
    } else if (error.message) {
      errorMessageText = error.message;
    }
    toast?.show('Erro ao salvar o fluxo: ' + errorMessageText, 'error'); // Usando toast
  } finally {
    isSaving.value = false;
  }
};
</script>

<style scoped>
/* Estilos específicos para este componente, se necessário */
</style>
