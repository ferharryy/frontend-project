<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-xl relative shadow-lg">
      <h2 class="text-xl font-semibold mb-4">{{ form.id ? 'Editar Usuário' : 'Novo Usuário' }}</h2>

      <!-- O alerta de sucesso foi removido daqui, pois o toast o substituirá -->

      <form @submit.prevent="save">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="userName" class="block text-sm font-medium text-gray-700">Nome Completo <span class="text-red-500">*</span></label>
            <input id="userName" v-model="form.name" placeholder="Nome Completo do Usuário" class="border p-2 rounded w-full" :class="{ 'border-red-500': errors.name }" />
            <p v-if="errors.name" class="text-red-500 text-xs mt-1">{{ errors.name }}</p>
          </div>

          <div>
            <label for="userNickname" class="block text-sm font-medium text-gray-700">Usuário (Apelido) <span class="text-red-500">*</span></label>
            <input id="userNickname" v-model="form.username" placeholder="Apelido de login" class="border p-2 rounded w-full" :class="{ 'border-red-500': errors.username }" />
            <p v-if="errors.username" class="text-red-500 text-xs mt-1">{{ errors.username }}</p>
          </div>

          <div>
            <label for="userEmail" class="block text-sm font-medium text-gray-700">Email de Contato <span class="text-red-500">*</span></label>
            <input id="userEmail" v-model="form.email" @blur="validateEmail" placeholder="Email do Usuário" class="border p-2 rounded w-full" :class="{ 'border-red-500': errors.email }" />
            <p v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email }}</p>
          </div>

          <div>
            <label for="userRole" class="block text-sm font-medium text-gray-700">Função <span class="text-red-500">*</span></label>
            <input id="userRole" v-model="form.role" placeholder="Ex: ADMIN, USER" class="border p-2 rounded w-full" :class="{ 'border-red-500': errors.role }" />
            <p v-if="errors.role" class="text-red-500 text-xs mt-1">{{ errors.role }}</p>
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


          <div class="col-span-2 flex items-center mt-2">
            <input id="isResponsible" type="checkbox" v-model="form.is_responsible" class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
            <label for="isResponsible" class="ml-2 block text-sm text-gray-900">É Responsável</label>
          </div>

          <div class="col-span-2" v-if="!form.id || showPasswordFields"> <label for="password" class="block text-sm font-medium text-gray-700">Senha <span class="text-red-500">*</span></label>
            <input id="password" type="password" v-model="form.password" placeholder="Senha do Usuário" class="border p-2 rounded w-full" :class="{ 'border-red-500': errors.password }" />
            <p v-if="errors.password" class="text-red-500 text-xs mt-1">{{ errors.password }}</p>
          </div>

          <div class="col-span-2" v-if="!form.id || showPasswordFields"> <label for="confirmPassword" class="block text-sm font-medium text-gray-700">Confirmar Senha <span class="text-red-500">*</span></label>
            <input id="confirmPassword" type="password" v-model="form.confirmPassword" placeholder="Confirme a Senha" class="border p-2 rounded w-full" :class="{ 'border-red-500': errors.confirmPassword || passwordMismatch }" />
            <p v-if="errors.confirmPassword" class="text-red-500 text-xs mt-1">{{ errors.confirmPassword }}</p>
            <p v-if="passwordMismatch" class="text-red-500 text-xs mt-1">As senhas não coincidem!</p>
          </div>

          <div class="col-span-2 flex items-center mt-2" v-if="form.id">
            <input id="changePassword" type="checkbox" v-model="showPasswordFields" class="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500" />
            <label for="changePassword" class="ml-2 block text-sm text-gray-900">Alterar senha</label>
          </div>

        </div>

        <!-- Div explícita para criar o espaçamento entre os campos e os botões -->
        <div class="h-6"></div> <!-- h-6 no Tailwind CSS corresponde a 1.5rem ou 24px de altura -->

        <div class="flex justify-end mt-6 space-x-2 gap-3">
          <button type="button" @click="$emit('close')" class="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors duration-200">Cancelar</button>
          <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200" >
            {{ isSaving ? 'Salvando...' : 'Salvar' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits, computed, onMounted, inject } from 'vue'; // Adicionado 'inject'
import { createUser, updateUser } from '@/services/userService';
import { getCompanyOptions } from '@/services/companyService';

const toast = inject('toast'); // Injeta a função toast

const props = defineProps({
  show: Boolean,
  user: Object
});

const emit = defineEmits(['close', 'saved']);

const form = ref({
  id: null,
  name: '',
  username: '',
  company_id: null,
  email: '',
  role: '',
  is_responsible: false,
  password: '',
  confirmPassword: '',
});

const errors = ref({});
const isSaving = ref(false);
const showPasswordFields = ref(false);

const companyOptions = ref([]);

onMounted(async () => {
  try {
    companyOptions.value = await getCompanyOptions();
  } catch (error) {
    console.error('Erro ao carregar empresas:', error);
    toast?.show('Erro ao carregar opções de empresas.', 'error'); // Usando toast
  }
});

// --- Computed Properties ---

const passwordMismatch = computed(() => {
  return form.value.password !== form.value.confirmPassword;
});

// A propriedade passwordMismatchAndVisible não é mais estritamente necessária para a UI, mas pode ser mantida para lógica interna se houver.
// const passwordMismatchAndVisible = computed(() => {
//   return (
//     (form.value.password || form.value.confirmPassword) &&
//     passwordMismatch.value &&
//     (!form.value.id || showPasswordFields.value)
//   );
// });

// --- Watcher para preencher o formulário quando o prop 'user' mudar ---
watch(() => props.user, (value) => {
  form.value = {
    id: null,
    name: '',
    username: '',
    company_id: null,
    email: '',
    role: '',
    is_responsible: false,
    password: '',
    confirmPassword: '',
  };

  if (value && value.id) {
    Object.assign(form.value, value);
    showPasswordFields.value = false;
  } else {
    showPasswordFields.value = true;
  }

  errors.value = {};
  // showSuccessAlert.value = false; // Removido, pois o toast gerencia o sucesso
}, { immediate: true });

// --- Funções de Validação ---

const validateUsername = () => {
    if (!form.value.username) {
        errors.value.username = 'Usuário (apelido) é obrigatório.';
    } else if (form.value.username.length < 3) {
        errors.value.username = 'Usuário deve ter no mínimo 3 caracteres.';
    } else {
        delete errors.value.username;
    }
    return !errors.value.username;
};

const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!form.value.email) {
    errors.value.email = 'E-mail é obrigatório.';
  } else if (!emailRegex.test(form.value.email)) {
    errors.value.email = 'E-mail inválido.';
  } else {
    delete errors.value.email;
  }
  return !errors.value.email;
};

const validateCompanyId = () => {
  if (form.value.company_id === null || form.value.company_id === '') {
    errors.value.company_id = 'ID da Empresa é obrigatório.';
  } else if (typeof form.value.company_id !== 'number' || form.value.company_id <= 0) {
    errors.value.company_id = 'ID da Empresa inválido.';
  } else {
    delete errors.value.company_id;
  }
  return !errors.value.company_id;
};

const validatePassword = () => {
  if (!form.value.id || showPasswordFields.value) {
    if (!form.value.password) {
      errors.value.password = 'Senha é obrigatória.';
    } else if (form.value.password.length < 6) {
      errors.value.password = 'A senha deve ter no mínimo 6 caracteres.';
    } else {
      delete errors.value.password;
    }

    if (!form.value.confirmPassword) {
      errors.value.confirmPassword = 'Confirmação de senha é obrigatória.';
    } else if (passwordMismatch.value) {
      errors.value.confirmPassword = 'As senhas não coincidem.';
    } else {
      delete errors.value.confirmPassword;
    }
    return !errors.value.password && !errors.value.confirmPassword && !passwordMismatch.value;
  }
  return true;
};

const validateForm = () => {
  errors.value = {};

  const isNameValid = !!form.value.name;
  if (!isNameValid) errors.value.name = 'Nome completo é obrigatório.';

  const isUsernameValid = validateUsername();

  const isEmailValid = validateEmail();

  const isRoleValid = !!form.value.role;
  if (!isRoleValid) errors.value.role = 'Função é obrigatória.';

  const isCompanyIdValid = validateCompanyId();

  const isPasswordValid = validatePassword();

  return isNameValid && isUsernameValid && isEmailValid && isRoleValid && isCompanyIdValid && isPasswordValid;
};

// --- Função Salvar ---
const save = async () => {
  if (!validateForm()) {
    return;
  }

  isSaving.value = true;
  // showSuccessAlert.value = false; // Removido, pois o toast gerencia o sucesso

  let payload = {
    name: form.value.name,
    username: form.value.username,
    email: form.value.email,
    role: form.value.role,
    company_id: form.value.company_id,
    is_responsible: form.value.is_responsible,
  };

  if (!form.value.id || showPasswordFields.value) {
    payload.password = form.value.password;
  }

  try {
    if (form.value.id) {
      await updateUser(form.value.id, payload);
      toast?.show('Usuário atualizado com sucesso!', 'success'); // Usando toast
    } else {
      await createUser(payload);
      toast?.show('Usuário criado com sucesso!', 'success'); // Usando toast
    }

    // showSuccessAlert.value = true; // Removido, pois o toast gerencia o sucesso

    // O setTimeout é removido ou ajustado para apenas fechar o modal
    // O toast tem sua própria duração
    setTimeout(() => {
      emit('close');
      emit('saved');
      // showSuccessAlert.value = false; // Removido
    }, 500); // Um pequeno delay para o toast ser visível antes do modal fechar

  } catch (error) {
    console.error('Erro ao salvar usuário:', error);
    let errorMessageText = 'Ocorreu um erro ao salvar o usuário. Por favor, tente novamente.';
    if (error.response && error.response.data && error.response.data.message) {
      errorMessageText = error.response.data.message;
    } else if (error.message) {
      errorMessageText = error.message;
    }
    toast?.show('Erro ao salvar o usuário: ' + errorMessageText, 'error'); // Usando toast
  } finally {
    isSaving.value = false;
  }
};
</script>

<style scoped>
/* Estilos específicos para este componente, se necessário */
</style>
