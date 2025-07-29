import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL_V1;

// Cấu hình header mặc định
const defaultHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json',
};

// Cấu hình header cho yêu cầu có token
const authHeaders = (accessToken) => ({
  token: `Bearer ${accessToken}`,
  ...defaultHeaders,
});

export const getDashboard = async (accessToken, axiosJWT) => {
  try {
    const response = await axiosJWT.get(`${API_URL}/dashboard`, {
      headers: authHeaders(accessToken),
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Lỗi hệ thống!';
    toast.error(errorMessage, { duration: 2000 });
    throw new Error(errorMessage);
  }
};
