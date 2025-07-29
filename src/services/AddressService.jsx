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

// Lấy tất cả địa chỉ của người dùng
export const getAddresses = async (accessToken, axiosJWT) => {
  try {
    const response = await axiosJWT.get(`${API_URL}/addresses/user/all`, {
      timeout: 15000,
      headers: authHeaders(accessToken),
    });
    console.log('Data address', response.data);

    // Sắp xếp địa chỉ với isDefault = true lên đầu
    if (response.data.data && Array.isArray(response.data.data)) {
      const sortedAddresses = [...response.data.data].sort((a, b) => {
        // Địa chỉ mặc định lên đầu
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return 0;
      });
      return sortedAddresses;
    }

    return response.data.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Lỗi hệ thống!';
    toast.error(errorMessage, { duration: 2000 });
    throw new Error(errorMessage);
  }
};

export const getAddressesByUserId = async (id, accessToken, axiosJWT) => {
  try {
    const response = await axiosJWT.get(`${API_URL}/addresses/user/all/${id}`, {
      timeout: 15000,
      headers: authHeaders(accessToken),
    });
    console.log('Data address', response.data);

    // Sắp xếp địa chỉ với isDefault = true lên đầu
    if (response.data.data && Array.isArray(response.data.data)) {
      const sortedAddresses = [...response.data.data].sort((a, b) => {
        // Địa chỉ mặc định lên đầu
        if (a.isDefault && !b.isDefault) return -1;
        if (!a.isDefault && b.isDefault) return 1;
        return 0;
      });
      return sortedAddresses;
    }

    return response.data.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Lỗi hệ thống!';
    toast.error(errorMessage, { duration: 2000 });
    throw new Error(errorMessage);
  }
};

// Thêm địa chỉ mới
export const addAddress = async (addressData, accessToken, axiosJWT, dispatch) => {
  dispatch(addStart());
  try {
    const response = await axiosJWT.post(`${API_URL}/addresses/add`, addressData, {
      timeout: 15000,
      headers: authHeaders(accessToken),
    });

    if (response.data.success) {
      dispatch(addSuccess());
      toast.success('Thêm địa chỉ thành công!', { duration: 2000 });
      return response.data;
    }
  } catch (error) {
    dispatch(addFailed());
    const errorMessage = error.response?.data?.message || 'Thêm địa chỉ thất bại!';
    toast.error(errorMessage, { duration: 2000 });
    throw new Error(errorMessage);
  }
};

// Cập nhật địa chỉ
export const updateAddress = async (addressId, addressData, accessToken, axiosJWT) => {
  try {
    const response = await axiosJWT.put(`${API_URL}/addresses/${addressId}`, addressData, {
      timeout: 15000,
      headers: authHeaders(accessToken),
    });

    if (response.data.success) {
      toast.success('Cập nhật địa chỉ thành công!', { duration: 2000 });
      return response.data;
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Cập nhật địa chỉ thất bại!';
    toast.error(errorMessage, { duration: 2000 });
    throw new Error(errorMessage);
  }
};

// Xóa địa chỉ
export const deleteAddress = async (addressId, accessToken, axiosJWT) => {
  try {
    const response = await axiosJWT.delete(`${API_URL}/addresses/${addressId}`, {
      timeout: 15000,
      headers: authHeaders(accessToken),
    });

    if (response.data.success) {
      toast.success('Xóa địa chỉ thành công!', { duration: 2000 });
      return response.data;
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Xóa địa chỉ thất bại!';
    toast.error(errorMessage, { duration: 2000 });
    throw new Error(errorMessage);
  }
};

// Cập nhật địa chỉ mặc định
export const setDefaultAddress = async (addressId, accessToken, axiosJWT) => {
  try {
    const response = await axiosJWT.put(
      `${API_URL}/addresses/${addressId}/set-default`,
      {},
      {
        timeout: 15000,
        headers: authHeaders(accessToken),
      },
    );

    if (response.data.success) {
      toast.success('Cập nhật địa chỉ mặc định thành công!', { duration: 2000 });
      return response.data;
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Cập nhật địa chỉ mặc định thất bại!';
    toast.error(errorMessage, { duration: 2000 });
    throw new Error(errorMessage);
  }
};
