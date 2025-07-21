// src/services/logService.js

import axios from 'axios';

const API_BASE = 'http://localhost:8080/logs'; // Endpoint do seu backend Quarkus para logs

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
 * Busca os logs mais recentes do backend.
 * @param {number} limit Opcional. O número máximo de logs a serem retornados. Padrão: 100.
 * @returns {Promise<Array<Object>>} Uma promessa que resolve para um array de objetos de log.
 */
export const getLogs = async (limit = 100) => {
  try {
    const response = await axios.get(API_BASE, {
      ...getAuthHeader(),
      params: { limit } // Adiciona o limite como parâmetro de query
    });
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar logs:', error);
    throw error;
  }
};
