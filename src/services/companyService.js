// src/services/companyService.js
import axios from 'axios';

const API_BASE = 'http://localhost:8080/companies';

function getAuthHeader() {
  const token = localStorage.getItem('jwt_token');
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  };
}

export const getCompanies = async () => {
  const response = await axios.get(API_BASE, getAuthHeader());
  return response.data; // agora retorna [{ id, name, cnpj, city, state }]
};

export const getCompanyById = async (id) => {
  const response = await axios.get(`${API_BASE}/${id}`, getAuthHeader());
  return response.data; // { id, name, cnpj, city, state }
};

export const createCompany = async (companyData) => {
  const response = await axios.post(API_BASE, companyData, getAuthHeader());
  return response.data; // { id, name, cnpj, city, state }
};

export const updateCompany = async (id, companyData) => {
  await axios.patch(`${API_BASE}/${id}`, companyData, getAuthHeader());
};

export const deleteCompany = async (id) => {
  await axios.delete(`${API_BASE}/${id}`, getAuthHeader());
};

export const getCompanyOptions = async () => {
  const response = await axios.get(API_BASE+'/company-options', getAuthHeader());
  return response.data; // [{ id, name }]
};

