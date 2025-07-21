// src/services/projectService.js
import axios from 'axios';

const API_BASE = 'http://localhost:8080/projects'; // Endpoint do seu backend Quarkus para projetos

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
 * Busca todos os projetos.
 * @returns {Promise<Array<Object>>} Uma promessa que resolve para um array de objetos de projeto.
 */
export const getProjects = async () => {
  try {
    const response = await axios.get(API_BASE, getAuthHeader());
    return response.data; // Espera que já venha como array de objetos planos
  } catch (error) {
    console.error('Erro ao buscar projetos:', error);
    throw error;
  }
};

/**
 * Busca um projeto por ID.
 * @param {number} id O ID do projeto.
 * @returns {Promise<Object>} Uma promessa que resolve para o objeto do projeto.
 */
export const getProjectById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE}/${id}`, getAuthHeader());
    return response.data; // Espera que já venha como objeto plano
  } catch (error) {
    console.error(`Erro ao buscar projeto com ID ${id}:`, error);
    throw error;
  }
};

/**
 * Cria um novo projeto.
 * @param {Object} projectData Os dados do projeto a serem criados.
 * @returns {Promise<Object>} Uma promessa que resolve para o objeto do projeto criado.
 */
export const createProject = async (projectData) => {
  try {
    const response = await axios.post(API_BASE, projectData, getAuthHeader());
    return response.data; // Espera que o backend retorne o projeto criado
  } catch (error) {
    console.error('Erro ao criar projeto:', error.response?.data || error.message);
    throw error;
  }
};

/**
 * Atualiza um projeto existente.
 * @param {number} id O ID do projeto a ser atualizado.
 * @param {Object} projectData Os dados do projeto para atualização.
 * @returns {Promise<void>} Uma promessa que resolve quando a atualização é bem-sucedida.
 */
export const updateProject = async (id, projectData) => {
  try {
    await axios.patch(`${API_BASE}/${id}`, projectData, getAuthHeader());
  } catch (error) {
    console.error(`Erro ao atualizar projeto com ID ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

/**
 * Deleta um projeto.
 * @param {number} id O ID do projeto a ser deletado.
 * @returns {Promise<void>} Uma promessa que resolve quando a exclusão é bem-sucedida.
 */
export const deleteProject = async (id) => {
  try {
    await axios.delete(`${API_BASE}/${id}`, getAuthHeader());
  } catch (error) {
    console.error(`Erro ao deletar projeto com ID ${id}:`, error.response?.data || error.message);
    throw error;
  }
};
