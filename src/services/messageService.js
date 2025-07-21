// Dentro de src/services/messageService.js

import axios from 'axios';

const API_BASE = 'http://localhost:8080/messages'; // Endpoint do seu backend Quarkus para mensagens

// Função auxiliar para obter o cabeçalho de autenticação JWT
function getAuthHeader() {
  const token = localStorage.getItem('jwt_token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
}


/**
 * Busca dados de mensagens para a sumarização de tokens.
 * @param {number} companyId Opcional. ID da empresa para filtrar.
 * @param {number} projectId Opcional. ID do projeto para filtrar.
 * @returns {Promise<Array<Object>>} Uma promessa que resolve para um array de objetos de mensagem.
 */
export const getTokensSummary = async (companyId = null, projectId = null) => {
  try {
    const params = {};
    if (companyId) params.companyId = companyId;
    if (projectId) params.projectId = projectId;

    const response = await axios.get(`${API_BASE}/tokens-summary`, {
      ...getAuthHeader(),
      params: params // Adiciona os parâmetros de query
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar resumo de tokens:', error);
    throw error;
  }
};