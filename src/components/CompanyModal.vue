<template>
  <div v-if="show" class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
    <div class="bg-white rounded-lg p-6 w-full max-w-xl relative shadow-lg">
      <h2 class="text-xl font-semibold mb-4">{{ form.id ? 'Editar Empresa' : 'Nova Empresa' }}</h2>

      <form @submit.prevent="save">
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">Nome <span class="text-red-500">*</span></label>
            <input id="name" v-model="form.name" placeholder="Nome" class="border p-2 rounded w-full" :class="{ 'border-red-500': errors.name }" />
            <p v-if="errors.name" class="text-red-500 text-xs mt-1">{{ errors.name }}</p>
          </div>

          <div>
            <label for="cnpj" class="block text-sm font-medium text-gray-700">CNPJ <span class="text-red-500">*</span></label>
            <input id="cnpj" v-model="form.cnpj" @input="applyCnpjMask" @blur="validateCnpj" placeholder="CNPJ" class="border p-2 rounded w-full" :class="{ 'border-red-500': errors.cnpj }" maxlength="18" />
            <p v-if="errors.cnpj" class="text-red-500 text-xs mt-1">{{ errors.cnpj }}</p>
          </div>

          <div>
            <label for="email" class="block text-sm font-medium text-gray-700">Email <span class="text-red-500">*</span></label>
            <input id="email" v-model="form.email" @blur="validateEmail" placeholder="Email" class="border p-2 rounded w-full" :class="{ 'border-red-500': errors.email }" />
            <p v-if="errors.email" class="text-red-500 text-xs mt-1">{{ errors.email }}</p>
          </div>

          <div>
            <label for="phone" class="block text-sm font-medium text-gray-700">Telefone <span class="text-red-500">*</span></label>
            <input id="phone" v-model="form.phone" @input="applyPhoneMask" @blur="validatePhone" placeholder="Telefone" class="border p-2 rounded w-full" :class="{ 'border-red-500': errors.phone }" maxlength="15" />
            <p v-if="errors.phone" class="text-red-500 text-xs mt-1">{{ errors.phone }}</p>
          </div>

          <div>
            <label for="city" class="block text-sm font-medium text-gray-700">Cidade <span class="text-red-500">*</span></label>
            <input id="city" v-model="form.city" placeholder="Cidade" class="border p-2 rounded w-full" :class="{ 'border-red-500': errors.city }" />
            <p v-if="errors.city" class="text-red-500 text-xs mt-1">{{ errors.city }}</p>
          </div>

          <div>
            <label for="state" class="block text-sm font-medium text-gray-700">Estado <span class="text-red-500">*</span></label>
            <input id="state" v-model="form.state" placeholder="Estado" class="border p-2 rounded w-full" :class="{ 'border-red-500': errors.state }" />
            <p v-if="errors.state" class="text-red-500 text-xs mt-1">{{ errors.state }}</p>
          </div>

          <div>
            <label for="country" class="block text-sm font-medium text-gray-700">País</label>
            <input id="country" v-model="form.country" placeholder="País" class="border p-2 rounded w-full" />
          </div>
          
          <div>
            <label for="zip_code" class="block text-sm font-medium text-gray-700">CEP <span class="text-red-500">*</span></label>
            <input id="zip_code" v-model="form.zip_code" @input="applyZipCodeMask" @blur="validateZipCode" placeholder="CEP" class="border p-2 rounded w-full" :class="{ 'border-red-500': errors.zip_code }" maxlength="9" />
            <p v-if="errors.zip_code" class="text-red-500 text-xs mt-1">{{ errors.zip_code }}</p>
          </div>

          <div class="col-span-2">
            <label for="address" class="block text-sm font-medium text-gray-700">Endereço <span class="text-red-500">*</span></label>
            <input id="address" v-model="form.address" placeholder="Endereço" class="border p-2 rounded w-full" :class="{ 'border-red-500': errors.address }" />
            <p v-if="errors.address" class="text-red-500 text-xs mt-1">{{ errors.address }}</p>
          </div>

          <div class="col-span-2">
            <label for="complement" class="block text-sm font-medium text-gray-700">Complemento</label>
            <input id="complement" v-model="form.complement" placeholder="Complemento" class="border p-2 rounded w-full" />
          </div>

          <div class="col-span-2">
            <label for="url" class="block text-sm font-medium text-gray-700">URL</label>
            <input id="url" v-model="form.url" @blur="validateUrl" placeholder="URL" class="border p-2 rounded w-full" :class="{ 'border-red-500': errors.url }" />
            <p v-if="errors.url" class="text-red-500 text-xs mt-1">{{ errors.url }}</p>
          </div>
        </div>

        <!-- Div explícita para criar o espaçamento entre os campos e os botões -->
        <div class="h-6"></div> <!-- h-6 no Tailwind CSS corresponde a 1.5rem ou 24px de altura -->

        <div class="flex justify-end mt-6 space-x-2 gap-3">
          <button type="button" @click="$emit('close')" class="bg-gray-300 px-4 py-2 rounded-md hover:bg-gray-400 transition-colors duration-200">Cancelar</button>
          <button type="submit" class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors duration-200">Salvar</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits } from 'vue';
import { createCompany, updateCompany } from '@/services/companyService';
import { inject } from 'vue'

const toast = inject('toast');

const props = defineProps({
  show: Boolean,
  company: Object
});

const emit = defineEmits(['close', 'saved']);

const form = ref({
  id: null,
  name: '',
  address: '',
  complement: '',
  phone: '',
  cnpj: '',
  email: '',
  city: '',
  state: '',
  country: '',
  zip_code: '',
  url: ''
});

const errors = ref({});

watch(() => props.company, (value) => {
  form.value = value
    ? { ...value }
    : {
        id: null,
        name: '', address: '', complement: '', phone: '', cnpj: '', email: '', city: '',
        state: '', country: '', zip_code: '', url: ''
      };
  errors.value = {};
}, { immediate: true });

// --- Funções de Máscara (Mantenha as mesmas) ---
const applyCnpjMask = () => {
  let value = form.value.cnpj.replace(/\D/g, '');
  if (value.length > 14) value = value.slice(0, 14);

  if (value.length > 12) {
    value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2}).*$/, '$1.$2.$3/$4-$5');
  } else if (value.length > 8) {
    value = value.replace(/^(\d{2})(\d{3})(\d{3})(\d{0,4}).*$/, '$1.$2.$3/$4');
  } else if (value.length > 5) {
    value = value.replace(/^(\d{2})(\d{3})(\d{0,3}).*$/, '$1.$2.$3');
  } else if (value.length > 2) {
    value = value.replace(/^(\d{2})(\d{0,3}).*$/, '$1.$2');
  }
  form.value.cnpj = value;
};

const applyPhoneMask = () => {
  let value = form.value.phone.replace(/\D/g, '');
  if (value.length > 11) value = value.slice(0, 11);

  if (value.length > 10) {
    value = value.replace(/^(\d{2})(\d{5})(\d{4}).*$/, '($1) $2-$3');
  } else if (value.length > 6) {
    value = value.replace(/^(\d{2})(\d{4})(\d{0_4}).*$/, '($1) $2-$3');
  } else if (value.length > 2) {
    value = value.replace(/^(\d{2})(\d{0_4}).*$/, '($1) $2');
  } else {
    value = value.replace(/^(\d*)$/, '($1');
  }
  form.value.phone = value;
};

const applyZipCodeMask = () => {
  let value = form.value.zip_code.replace(/\D/g, '');
  if (value.length > 8) value = value.slice(0, 8);

  if (value.length > 5) {
    value = value.replace(/^(\d{5})(\d{0,3}).*$/, '$1-$2');
  }
  form.value.zip_code = value;
};

// --- Funções de Validação (Mantenha as mesmas) ---
const validateCnpj = () => {
  const cnpj = form.value.cnpj.replace(/\D/g, '');

  if (!cnpj) {
    errors.value.cnpj = 'CNPJ é obrigatório.';
    return false;
  }
  if (cnpj.length !== 14) {
    errors.value.cnpj = 'CNPJ deve conter 14 dígitos.';
    return false;
  }
  if (/^(\d)\1{13}$/.test(cnpj)) {
    errors.value.cnpj = 'CNPJ inválido.';
    return false;
  }

  let size = cnpj.length - 2;
  let numbers = cnpj.substring(0, size);
  const digits = cnpj.substring(size);
  let sum = 0;
  let pos = size - 7;

  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(0))) {
    errors.value.cnpj = 'CNPJ inválido.';
    return false;
  }

  size = size + 1;
  numbers = cnpj.substring(0, size);
  sum = 0;
  pos = size - 7;
  for (let i = size; i >= 1; i--) {
    sum += parseInt(numbers.charAt(size - i)) * pos--;
    if (pos < 2) pos = 9;
  }

  result = sum % 11 < 2 ? 0 : 11 - (sum % 11);
  if (result !== parseInt(digits.charAt(1))) {
    errors.value.cnpj = 'CNPJ inválido.';
    return false;
  }

  delete errors.value.cnpj;
  return true;
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

const validatePhone = () => {
  const phone = form.value.phone.replace(/\D/g, '');
  if (!phone) {
    errors.value.phone = 'Telefone é obrigatório.';
  } else if (phone.length < 10 || phone.length > 11) {
    errors.value.phone = 'Telefone inválido (mín. 10 ou 11 dígitos com DDD).';
  } else {
    delete errors.value.phone;
  }
  return !errors.value.phone;
};

const validateZipCode = () => {
  const zip_code = form.value.zip_code.replace(/\D/g, '');
  if (!zip_code) {
    errors.value.zip_code = 'CEP é obrigatório.';
  } else if (zip_code.length !== 8) {
    errors.value.zip_code = 'CEP deve conter 8 dígitos.';
  } else {
    delete errors.value.zip_code;
  }
  return !errors.value.zip_code;
};

const validateUrl = () => {
  const urlRegex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;

  if (!form.value.url) {
    delete errors.value.url;
    return true;
  } else if (!urlRegex.test(form.value.url)) {
    errors.value.url = 'URL inválida. Ex: https://www.exemplo.com';
  } else {
    delete errors.value.url;
  }
  return true;
};

const validateForm = () => {
  errors.value = {};

  const isNameValid = !!form.value.name;
  if (!isNameValid) errors.value.name = 'Nome é obrigatório.';

  const isCnpjValid = validateCnpj();
  const isEmailValid = validateEmail();
  const isPhoneValid = validatePhone();

  const isCityValid = !!form.value.city;
  if (!isCityValid) errors.value.city = 'Cidade é obrigatória.';

  const isStateValid = !!form.value.state;
  if (!isStateValid) errors.value.state = 'Estado é obrigatório.';

  const isZipCodeValid = validateZipCode();
  const isAddressValid = !!form.value.address;
  if (!isAddressValid) errors.value.address = 'Endereço é obrigatório.';

  const isUrlValid = validateUrl();

  return isNameValid && isCnpjValid && isEmailValid && isPhoneValid &&
           isCityValid && isStateValid && isZipCodeValid && isAddressValid &&
           isUrlValid;
};

// --- Função Salvar com ajuste para exclusão do ID na criação e alerta de sucesso ---
const save = async () => {
  if (validateForm()) {
    let dataToProcess = { ...form.value };
    dataToProcess.cnpj = dataToProcess.cnpj.replace(/\D/g, '');
    dataToProcess.phone = dataToProcess.phone.replace(/\D/g, '');
    dataToProcess.zip_code = dataToProcess.zip_code.replace(/\D/g, '');

    try {
      if (dataToProcess.id) {
        await updateCompany(dataToProcess.id, dataToProcess);
      } else {
        const { id, ...companyDataForCreation } = dataToProcess;
        await createCompany(companyDataForCreation);
      }

      toast?.show('Empresa salva com sucesso!', 'success');
      emit('close');
      emit('saved');
      
    } catch (error) {
      console.error('Erro ao salvar empresa:', error);
      toast?.show('Erro ao salvar a empresa: ' + (error.response?.data || error.message), 'error');
    }
  }
};

</script>

<style scoped>
/* Estilos específicos para este componente, se necessário */
</style>
