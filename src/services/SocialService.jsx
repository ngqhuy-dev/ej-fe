import { loginFailed, loginStart, loginSuccess } from '@/redux/authSlice.jsx';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_URL = import.meta.env.VITE_API_URL_V1;

export const loginGoogle = async (navigate, dispatch) => {
  dispatch(loginStart());
  try {
    const res = await axios.get(`${API_URL}/auth/login/success`, {
      withCredentials: true,
    });
    toast.dismiss();
    toast.success('Đăng nhập thành công!', {
      autoClose: 1000,
      position: 'top-center',
    });
    const { accessToken, ...user } = res.data;
    dispatch(loginSuccess({ ...user, accessToken }));
    navigate('/');
  } catch (error) {
    dispatch(loginFailed());
    toast.dismiss();
    toast.error(error.response?.data.message, {
      autoClose: 1000,
    });
  }
};
