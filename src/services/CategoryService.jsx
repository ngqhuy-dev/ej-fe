import { addStart, addSuccess, addFailed, resetAddState } from '@/redux/itemSlice.jsx';
import axios from 'axios';
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

// NOTE: Lấy danh sách danh mục
export const getCategoriesAll = async () => {
  try {
    console.log(`🔍 Fetching categories from: ${API_URL}/categories`);
    const response = await axios.get(`${API_URL}/categories`, {
      timeout: 10000,
      headers: defaultHeaders,
    });

    console.log(`✅ Received ${response.data.length} categories`);
    if (response.data.length > 0) {
      console.log('📝 First category:', response.data[0]);
    }

    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Lỗi hệ thống!';
    toast.error(errorMessage, { duration: 2000 });
    throw new Error(errorMessage);
  }
};
// NOTE: Lấy danh mục theo ID
export const getCategories = async (id) => {
  if (!id) throw new Error('ID danh mục không hợp lệ!');

  try {
    console.log(`🔍 Fetching category with ID: ${id} from: ${API_URL}/categories/${id}`);
    const response = await axios.get(`${API_URL}/categories/${id}`, {
      timeout: 10000,
      headers: defaultHeaders,
    });

    console.log(`✅ Received category:`, response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Error fetching category:', error);
    console.error('Error details:', error.response?.data || error.message);

    const errorMessage = error.response?.data?.message || 'Lỗi hệ thống!';
    toast.error(errorMessage, { duration: 2000 });
    throw new Error(errorMessage);
  }
};

// NOTE: Thêm danh mục mới
export const addCategories = async (formData, dispatch, accessToken, axiosJWT) => {
  if (!formData || !accessToken || !axiosJWT) {
    toast.error('Dữ liệu đầu vào không hợp lệ!', { duration: 2000 });
    throw new Error('Dữ liệu đầu vào không hợp lệ!');
  }

  dispatch(addStart());
  try {
    const res = await axiosJWT.post(`${API_URL}/categories/create`, formData, {
      headers: formDataHeaders(accessToken),
    });

    dispatch(addSuccess(res.data));
    toast.success('Thêm danh mục thành công!', { duration: 2000 });
    dispatch(resetAddState());
    return res.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Lỗi hệ thống!';
    dispatch(addFailed(errorMessage));
    toast.error(errorMessage, { duration: 2000 });
    throw new Error(errorMessage);
  }
};

// NOTE: Cập nhật danh mục
export const editCategory = async (id, formData, accessToken, axiosJWT) => {
  if (!id || !formData || !accessToken || !axiosJWT) {
    toast.error('Dữ liệu đầu vào không hợp lệ!', { duration: 2000 });
    throw new Error('Dữ liệu đầu vào không hợp lệ!');
  }

  try {
    const res = await axiosJWT.patch(`${API_URL}/categories/update/${id}`, formData, {
      headers: formDataHeaders(accessToken),
    });

    toast.success('Cập nhật danh mục thành công!', { duration: 2000 });
    return res.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Lỗi hệ thống!';
    toast.error(errorMessage, { duration: 2000 });
    throw new Error(errorMessage);
  }
};

// NOTE: Xóa danh mục
export const deleteCategory = async (id, accessToken, axiosJWT) => {
  if (!id || !accessToken || !axiosJWT) {
    toast.error('Dữ liệu đầu vào không hợp lệ!', { duration: 2000 });
    throw new Error('Dữ liệu đầu vào không hợp lệ!');
  }

  try {
    await axiosJWT.delete(`${API_URL}/categories/delete/${id}`, {
      headers: authHeaders(accessToken),
    });

    toast.success('Xóa danh mục thành công!', { duration: 2000 });
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Lỗi hệ thống!';
    toast.error(errorMessage, { duration: 2000 });
    throw new Error(errorMessage);
  }
};
