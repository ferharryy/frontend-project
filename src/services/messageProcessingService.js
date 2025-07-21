// src/services/messageProcessingService.js
import axios from 'axios';

const API_BASE = 'http://localhost:8080/message-processing'; // Endpoint do seu backend Quarkus para fluxos

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
 * Busca todos os fluxos de processamento de mensagens.
 * @returns {Promise<Array<Object>>} Uma promessa que resolve para um array de objetos de fluxo.
 */
export const getMessageProcessing = async () => {
  try {
    const response = await axios.get(API_BASE, getAuthHeader());
    return response.data; // Espera que já venha como array de objetos planos
  } catch (error) {
    console.error('Erro ao buscar fluxos:', error);
    throw error;
  }
};

/**
 * Busca um fluxo por ID.
 * @param {number} id O ID do fluxo.
 * @returns {Promise<Object>} Uma promessa que resolve para o objeto do fluxo.
 */
export const getMessageProcessingById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE}/${id}`, getAuthHeader());
    return response.data; // Espera que já venha como objeto plano
  } catch (error) {
    console.error(`Erro ao buscar fluxo com ID ${id}:`, error);
    throw error;
  }
};

/**
 * Cria um novo fluxo de processamento de mensagens.
 * @param {Object} flowData Os dados do fluxo a serem criados.
 * @returns {Promise<Object>} Uma promessa que resolve para o objeto do fluxo criado.
 */
export const createMessageProcessing = async (flowData) => {
  try {
    const response = await axios.post(API_BASE, flowData, getAuthHeader());
    return response.data; // Espera que o backend retorne o fluxo criado
  } catch (error) {
    console.error('Erro ao criar fluxo:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Atualiza um fluxo de processamento de mensagens existente.
 * @param {number} id O ID do fluxo a ser atualizado.
 * @param {Object} flowData Os dados do fluxo para atualização.
 * @returns {Promise<void>} Uma promessa que resolve quando a atualização é bem-sucedida.
 */
export const updateMessageProcessing = async (id, flowData) => {
  try {
    await axios.patch(`${API_BASE}/${id}`, flowData, getAuthHeader());
  } catch (error) {
    console.error(`Erro ao atualizar fluxo com ID ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Deleta um fluxo de processamento de mensagens.
 * @param {number} id O ID do fluxo a ser deletado.
 * @returns {Promise<void>} Uma promessa que resolve quando a exclusão é bem-sucedida.
 */
export const deleteMessageProcessing = async (id) => {
  try {
    await axios.delete(`${API_BASE}/${id}`, getAuthHeader());
  } catch (error) {
    console.error(`Erro ao deletar fluxo com ID ${id}:`, error.response?.data || error.message);
    throw error;
  }
};
