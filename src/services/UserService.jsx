import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL_V1;

// Cấu hình header mặc định
const defaultHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

// Cấu hình header cho form-data
const formDataHeaders = (accessToken) => ({
  token: `Bearer ${accessToken}`,
  'Content-Type': 'multipart/form-data',
});

// Cấu hình header cho yêu cầu có token
const authHeaders = (accessToken) => ({
  token: `Bearer ${accessToken}`,
  ...defaultHeaders,
});

export const getAllUsers = async (accessToken, axiosJWT) => {
  try {
    const response = await axiosJWT.get(`${API_URL}/users`, {
      timeout: 10000,
      headers: authHeaders(accessToken),
    });
    return response.data.users;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Lỗi hệ thống!';
    toast.error(errorMessage, { duration: 2000 });
    throw new Error(errorMessage);
  }
};

export const getInfoUser = async (accessToken, axiosJWT) => {
  try {
    const response = await axiosJWT.get(`${API_URL}/users/info-user`, {
      timeout: 10000,
      headers: authHeaders(accessToken),
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Lỗi hệ thống!';
    toast.error(errorMessage, { duration: 2000 });
    throw new Error(errorMessage);
  }
};

export const getInfoUserById = async (id, accessToken, axiosJWT) => {
  try {
    const response = await axiosJWT.get(`${API_URL}/users/info-user/${id}`, {
      timeout: 10000,
      headers: authHeaders(accessToken),
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Lỗi hệ thống!';
    toast.error(errorMessage, { duration: 2000 });
    throw new Error(errorMessage);
  }
};

export const updateUser = async (formData, accessToken, axiosJWT) => {
  try {
    const response = await axiosJWT.patch(`${API_URL}/users/info-user/update`, formData, {
      headers: formDataHeaders(accessToken),
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Lỗi hệ thống!';
    throw new Error(errorMessage);
  }
};
export const updateUserById = async (id, formData, accessToken, axiosJWT) => {
  try {
    const response = await axiosJWT.patch(`${API_URL}/users/info-user/update/${id}`, formData, {
      headers: formDataHeaders(accessToken),
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Lỗi hệ thống!';
    throw new Error(errorMessage);
  }
};

export const uploadAvatar = async (formData, accessToken, axiosJWT) => {
  try {
    const response = await axiosJWT.patch(`${API_URL}/users/info-user/update`, formData, {
      headers: formDataHeaders(accessToken),
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Lỗi hệ thống!';
    throw new Error(errorMessage);
  }
};

export const uploadAvatarById = async (id, formData, accessToken, axiosJWT) => {
  try {
    const response = await axiosJWT.patch(`${API_URL}/users/info-user/update/${id}`, formData, {
      headers: formDataHeaders(accessToken),
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Lỗi hệ thống!';
    throw new Error(errorMessage);
  }
};
