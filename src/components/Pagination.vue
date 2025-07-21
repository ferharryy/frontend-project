<template>
    <div v-if="totalPages > 1" class="flex justify-center items-center mt-6 space-x-2 text-sm">
      <button
        @click="goToPage(1)"
        :disabled="currentPage === 1"
        class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-100 transition-colors duration-200
               disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Primeira página"
      >
        &laquo; 
      </button>
  
      <button
        @click="goToPage(currentPage - 1)"
        :disabled="currentPage === 1"
        class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-100 transition-colors duration-200
               disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Página anterior"
      >
        &lsaquo; 
      </button>
  
      <template v-for="(page, index) in pagesToShow" :key="index">
        <span v-if="page === '...'" class="px-4 py-2 text-gray-500 pointer-events-none">...</span>
        <button
          v-else
          @click="goToPage(page)"
          class="px-4 py-2 border border-gray-300 rounded-lg transition-colors duration-200"
          :class="{
            'bg-blue-600 text-white border-blue-600 shadow-md': currentPage === page,
            'bg-white text-gray-700 hover:bg-blue-50 hover:text-blue-700': currentPage !== page
          }"
          :aria-current="currentPage === page ? 'page' : null"
          :aria-label="`Ir para página ${page}`"
        >
          {{ page }}
        </button>
      </template>
  
      <button
        @click="goToPage(currentPage + 1)"
        :disabled="currentPage === totalPages"
        class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-100 transition-colors duration-200
               disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Próxima página"
      >
        &rsaquo; 
      </button>
  
      <button
        @click="goToPage(totalPages)"
        :disabled="currentPage === totalPages"
        class="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-100 transition-colors duration-200
               disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Última página"
      >
        &raquo; 
      </button>
    </div>
  </template>
  
  <script setup>
  import { computed } from 'vue';
  
  const props = defineProps({
    currentPage: {
      type: Number,
      required: true
    },
    totalPages: {
      type: Number,
      required: true
    },
    maxVisibleButtons: { // Número máximo de botões de página visíveis (excluindo Anterior/Próximo/Primeiro/Último)
      type: Number,
      default: 5 // Ajustado para 5, o que é um bom padrão
    }
  });
  
  const emit = defineEmits(['update:currentPage']);
  
  const goToPage = (page) => {
    if (page >= 1 && page <= props.totalPages) {
      emit('update:currentPage', page);
    }
  };
  
  const pagesToShow = computed(() => {
    const pages = [];
    const totalButtons = props.maxVisibleButtons;
    const half = Math.floor(totalButtons / 2);
  
    let startPage = Math.max(1, props.currentPage - half);
    let endPage = Math.min(props.totalPages, startPage + totalButtons - 1);
  
    // Ajusta startPage se endPage atingir o limite
    if (endPage - startPage + 1 < totalButtons) {
      startPage = Math.max(1, endPage - totalButtons + 1);
    }
  
    // Adiciona a primeira página e "..." se necessário
    if (startPage > 1) {
      pages.push(1);
      if (startPage > 2) pages.push('...');
    }
  
    // Adiciona as páginas visíveis
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
  
    // Adiciona "..." e a última página se necessário
    if (endPage < props.totalPages) {
      if (endPage < props.totalPages - 1) pages.push('...');
      pages.push(props.totalPages);
    }
  
    return pages;
  });
  </script>