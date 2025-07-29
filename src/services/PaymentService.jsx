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

export const paymentService = async (orderId, accessToken, axiosJWT) => {
  try {
    const res = await axiosJWT.post(
      `${API_URL}/payments/vnpay/create_url`,
      { orderId },
      {
        headers: authHeaders(accessToken),
      },
    );
    return res.data;
  } catch (error) {
    toast.error(error.response?.data.message, { duration: 2000 });
    return null;
  }
};
