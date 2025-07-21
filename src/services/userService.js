// src/services/userService.js
import axios from 'axios';

const API_BASE = 'http://localhost:8080/users';

function getAuthHeader() {
  const token = localStorage.getItem('jwt_token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
}

export const getUsers = async () => {
  try {
    const response = await axios.get(API_BASE, getAuthHeader());
    return response.data; // já vem como array de objetos planos
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    throw error;
  }
};

export const getUserById = async (id) => {
  try {
    const response = await axios.get(`${API_BASE}/${id}`, getAuthHeader());
    return response.data; // já vem como objeto plano
  } catch (error) {
    console.error(`Erro ao buscar usuário com ID ${id}:`, error);
    throw error;
  }
};

export const createUser = async (userData) => {
  try {
    const response = await axios.post(API_BASE, userData, getAuthHeader());
    return response.data; // se backend retornar o usuário criado
  } catch (error) {
    console.error('Erro ao criar usuário:', error.response?.data || error.message);
    throw error;
  }
};

export const updateUser = async (id, userData) => {
  try {
    const response = await axios.patch(`${API_BASE}/${id}`, userData, getAuthHeader());
    return response.data; // se backend retornar dados (se não, pode ser `null`)
  } catch (error) {
    console.error(`Erro ao atualizar usuário com ID ${id}:`, error.response?.data || error.message);
    throw error;
  }
};

export const deleteUser = async (id) => {
  try {
    await axios.delete(`${API_BASE}/${id}`, getAuthHeader());
  } catch (error) {
    console.error(`Erro ao deletar usuário com ID ${id}:`, error.response?.data || error.message);
    throw error;
  }
};
