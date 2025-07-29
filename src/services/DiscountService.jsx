import { addStart, addSuccess, addFailed, resetAddState } from '@/redux/itemSlice.jsx';
import axios from 'axios';
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

// NOTE: Create discount
export const addDiscount = async (data, dispatch, accessToken, axiosJWT) => {
  if (!data || !accessToken || !axiosJWT) {
    toast.error('Dữ liệu đầu vào không hợp lệ!', { duration: 2000 });
    throw new Error('Dữ liệu đầu vào không hợp lệ!');
  }

  return toast.promise(
    async () => {
      dispatch(addStart());
      try {
        const res = await axiosJWT.post(`${API_URL}/discounts/create`, data, {
          headers: authHeaders(accessToken),
        });
        dispatch(addSuccess(res.data));
        dispatch(resetAddState());
        return res.data;
      } catch (error) {
        const errorMessage = error.response?.data?.message || 'Lỗi hệ thống!';
        console.error('Discount creation error:', error.response?.data || error);
        dispatch(addFailed(errorMessage));
        throw error;
      }
    },
    {
      loading: 'Đang thêm mã giảm giá...',
      success: <b>Thêm mã giảm giá thành công!</b>,
      error: (error) => {
        const errorMessage =
          error.response?.data?.message ||
          (error.response?.data?.err === 'code' ? 'Mã giảm giá đã tồn tại' : 'Lỗi hệ thống!');
        return <b>{errorMessage}</b>;
      },
    },
    {
      success: { duration: 2000 },
      error: { duration: 2000 },
    },
  );
};

// NOTE: Get all discounts
export const getAllDiscount = async () => {
  try {
    const res = await axios.get(`${API_URL}/discounts/all`);
    return Array.isArray(res.data) ? res.data : res.data.data && Array.isArray(res.data.data) ? res.data.data : [];
  } catch (error) {
    console.error('Error fetching discounts:', error);
    return [];
  }
};

// NOTE: Get discount by user
export const getAllDiscountUser = async (id, accessToken, axiosJWT) => {
  if (!accessToken || !axiosJWT) {
    toast.error('Hết phiên đăng nhập!', { duration: 2000 });
    throw new Error('Dữ liệu đầu vào không hợp lệ!');
  }
  try {
    const res = await axiosJWT.get(`${API_URL}/discounts/by-user/${id}`, {
      headers: authHeaders(accessToken),
    });
    return Array.isArray(res.data) ? res.data : res.data.data && Array.isArray(res.data.data) ? res.data.data : [];
  } catch (error) {
    console.error(`Error:`, error);
    return [];
  }
};

// NOTE: Get discount by ID
export const getDiscountById = async (id) => {
  try {
    const res = await axios.get(`${API_URL}/discounts/${id}`);
    return res.data;
  } catch (error) {
    console.error(`Error fetching discount with id ${id}:`, error);
    throw error;
  }
};

// NOTE: Edit discount
export const editDiscount = async (id, updateData, accessToken, axiosJWT) => {
  if (!id || !updateData || !accessToken || !axiosJWT) {
    toast.error('Dữ liệu đầu vào không hợp lệ!', { duration: 2000 });
    throw new Error('Dữ liệu đầu vào không hợp lệ!');
  }

  return toast.promise(
    async () => {
      const res = await axiosJWT.put(`${API_URL}/discounts/${id}`, updateData, {
        headers: authHeaders(accessToken),
      });
      return res.data;
    },
    {
      loading: 'Đang cập nhật mã giảm giá...',
      success: <b>Cập nhật mã giảm giá thành công!</b>,
      error: (error) => {
        const errorMessage = error.response?.data?.message || 'Lỗi hệ thống!';
        return <b>{errorMessage}</b>;
      },
    },
    {
      success: { duration: 2000 },
      error: { duration: 2000 },
    },
  );
};

// NOTE: Delete discount
export const deleteDiscount = async (id, accessToken, axiosJWT) => {
  if (!id || !accessToken || !axiosJWT) {
    toast.error('Dữ liệu đầu vào không hợp lệ!', { duration: 2000 });
    throw new Error('Dữ liệu đầu vào không hợp lệ!');
  }

  return toast.promise(
    async () => {
      const res = await axiosJWT.delete(`${API_URL}/discounts/${id}`, {
        headers: authHeaders(accessToken),
      });
      return res.data;
    },
    {
      loading: 'Đang xóa mã giảm giá...',
      success: <b>Xóa mã giảm giá thành công!</b>,
      error: (error) => {
        const errorMessage = error.response?.data?.message || 'Lỗi hệ thống!';
        return <b>{errorMessage}</b>;
      },
    },
    {
      success: { duration: 2000 },
      error: { duration: 2000 },
    },
  );
};

// NOTE: Toggle discount active status
export const toggleDiscountStatus = async (id, accessToken, axiosJWT) => {
  if (!id || !accessToken || !axiosJWT) {
    toast.error('Dữ liệu đầu vào không hợp lệ!', { duration: 2000 });
    throw new Error('Dữ liệu đầu vào không hợp lệ!');
  }

  return toast.promise(
    async () => {
      const res = await axiosJWT.patch(
        `${API_URL}/discounts/toggle/${id}`,
        {},
        {
          headers: authHeaders(accessToken),
        },
      );
      return res.data;
    },
    {
      loading: 'Đang cập nhật trạng thái...',
      success: <b>Cập nhật trạng thái thành công!</b>,
      error: (error) => {
        const errorMessage = error.response?.data?.message || 'Lỗi hệ thống!';
        return <b>{errorMessage}</b>;
      },
    },
    {
      success: { duration: 2000 },
      error: { duration: 2000 },
    },
  );
};
