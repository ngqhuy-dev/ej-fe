import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL_V1 || import.meta.env.VITE_API_URL_V2;

const refreshToken = async () => {
  try {
    const res = await axios.post(
      `${API_URL}/auth/refresh`,
      {},
      {
        withCredentials: true,
      },
    );
    return res.data;
  } catch (err) {
    console.error('Refresh token error:', err);
    // Xóa localStorage và chuyển hướng về trang login
    localStorage.removeItem('persist:root');
    window.location.href = '/login';
    throw err;
  }
};

export const createAxios = (user, dispatch, stateSuccess) => {
  const newInstance = axios.create();
  newInstance.interceptors.request.use(
    async (config) => {
      let date = new Date();
      const decodedToken = jwtDecode(user?.accessToken);
      if (decodedToken.exp < date.getTime() / 1000) {
        try {
          const data = await refreshToken();
          const refreshUser = {
            ...user,
            accessToken: data.accessToken,
          };
          dispatch(stateSuccess(refreshUser));
          config.headers['token'] = 'Bearer ' + data.accessToken;
        } catch {
          toast.error('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại!');
        }
      }
      return config;
    },
    (err) => {
      return Promise.reject(err);
    },
  );
  return newInstance;
};
