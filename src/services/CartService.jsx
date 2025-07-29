import { addStart, addSuccess, addFailed } from '@/redux/itemSlice.jsx';
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

//NOTE: Thêm sản phẩm vào giỏ hàng
export const addItemToCart = async (formData, dispatch, accessToken, axiosJWT) => {
  if (!formData || !accessToken || !axiosJWT) {
    toast.error('Dữ liệu đầu vào không hợp lệ!', { duration: 2000 });
    throw new Error('Dữ liệu đầu vào không hợp lệ!');
  }

  return toast.promise(
    async () => {
      dispatch(addStart());
      const res = await axiosJWT.post(`${API_URL}/carts/add`, formData, {
        headers: authHeaders(accessToken),
      });
      dispatch(addSuccess(res.data));
      const itemCount = res.data.itemCount;
      if (typeof itemCount !== 'undefined') {
        sessionStorage.setItem('itemCount', itemCount.toString());
        window.dispatchEvent(new CustomEvent('itemCountChanged', { detail: itemCount }));
      }
      return res.data;
    },
    {
      loading: 'Đang thêm sản phẩm...',
      success: <b>Thêm sản phẩm thành công!</b>,
      error: (error) => {
        const errorMessage = error.response?.data?.message || 'Lỗi hệ thống!';
        dispatch(addFailed(errorMessage));
        return <b>{errorMessage}</b>;
      },
    },
    {
      success: { duration: 2000 },
      error: { duration: 2000 },
      position: 'top-center',
    },
  );
};

export const getCart = async (accessToken, axiosJWT) => {
  try {
    const response = await axiosJWT.get(`${API_URL}/carts`, {
      headers: authHeaders(accessToken),
    });
    const itemCount = response.data.itemCount;
    if (typeof itemCount !== 'undefined') {
      sessionStorage.setItem('itemCount', itemCount.toString());
      window.dispatchEvent(new CustomEvent('itemCountChanged', { detail: itemCount }));
    }

    return response.data;
  } catch (error) {
    throw error.response?.data || 'Lỗi hệ thống!';
  }
};

export const deleteItemInCart = async (_id, accessToken, axiosJWT) => {
  try {
    const response = await axiosJWT.delete(`${API_URL}/carts/remove/${_id}`, {
      headers: authHeaders(accessToken),
    });
    const itemCount = response.data.itemCount;
    if (typeof itemCount !== 'undefined') {
      sessionStorage.setItem('itemCount', itemCount.toString());
      window.dispatchEvent(new CustomEvent('itemCountChanged', { detail: itemCount }));
    }

    return response.data;
  } catch (error) {
    throw error.response?.data || 'Lỗi hệ thống!';
  }
};

export const updateItemInCart = async (formData, accessToken, axiosJWT) => {
  try {
    const response = await axiosJWT.patch(`${API_URL}/carts/update`, formData, {
      headers: authHeaders(accessToken),
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || 'Lỗi hệ thống!';
  }
};
