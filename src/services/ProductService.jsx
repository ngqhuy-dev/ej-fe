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

// NOTE: Lấy danh sách sản phẩm
export const getProductsAll = async () => {
  try {
    const response = await axios.get(`${API_URL}/products`, {
      timeout: 10000,
      headers: defaultHeaders,
    });

    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Lỗi hệ thống!';
    toast.error(errorMessage, { duration: 2000 });
    throw new Error(errorMessage);
  }
};

//NOTE: Danh sách sản phẩm theo danh mục
export const getProductsByIdCategory = async (idCategory) => {
  try {
    const response = await axios.get(`${API_URL}/products/category/${idCategory}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || 'Lỗi hệ thống!';
  }
};

// NOTE: Lấy sản phẩm theo ID
export const getProduct = async (id) => {
  if (!id) throw new Error('ID sản phẩm không hợp lệ!');

  try {
    console.log(`🔍 Fetching category with ID: ${id} from: ${API_URL}/products/${id}`);
    const response = await axios.get(`${API_URL}/products/${id}`, {
      timeout: 10000,
      headers: defaultHeaders,
    });

    return response.data;
  } catch (error) {
    console.error('❌ Error fetching category:', error);
    console.error('Error details:', error.response?.data || error.message);

    const errorMessage = error.response?.data?.message || 'Lỗi hệ thống!';
    toast.error(errorMessage, { duration: 2000 });
    throw new Error(errorMessage);
  }
};

// NOTE: Thêm sản phẩm mới
export const addProducts = async (formData, dispatch, accessToken, axiosJWT) => {
  if (!formData || !accessToken || !axiosJWT) {
    toast.error('Dữ liệu đầu vào không hợp lệ!', { duration: 2000 });
    throw new Error('Dữ liệu đầu vào không hợp lệ!');
  }

  return toast.promise(
    async () => {
      dispatch(addStart());
      const res = await axiosJWT.post(`${API_URL}/products/create`, formData, {
        headers: formDataHeaders(accessToken),
      });
      dispatch(addSuccess(res.data));
      dispatch(resetAddState());
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
      success: { duration: 2000 }, // Tùy chỉnh thời gian hiển thị cho success
      error: { duration: 2000 }, // Tùy chỉnh thời gian hiển thị cho error
    },
  );
};

// NOTE: Cập nhật sản phẩm
export const editProduct = async (id, formData, accessToken, axiosJWT) => {
  if (!id || !formData || !accessToken || !axiosJWT) {
    toast.error('Dữ liệu đầu vào không hợp lệ!', { duration: 2000 });
    throw new Error('Dữ liệu đầu vào không hợp lệ!');
  }

  return toast.promise(
    axiosJWT.patch(`${API_URL}/products/update/${id}`, formData, {
      headers: formDataHeaders(accessToken),
    }),
    {
      loading: 'Đang cập nhật sản phẩm...',
      success: <b>Cập nhật sản phẩm thành công!</b>,
      error: (error) => {
        const errorMessage = error.response?.data?.message || 'Lỗi hệ thống!';
        return <b>{errorMessage}</b>;
      },
    },
    {
      duration: 1500, // Thời gian hiển thị cho success (tùy chọn)
    },
  );
};

// NOTE: Xóa sản phẩm
export const deleteProduct = async (id, accessToken, axiosJWT) => {
  if (!id || !accessToken || !axiosJWT) {
    toast.error('Dữ liệu đầu vào không hợp lệ!', { duration: 2000 });
    throw new Error('Dữ liệu đầu vào không hợp lệ!');
  }
  return toast.promise(
    await axiosJWT.delete(`${API_URL}/products/delete/${id}`, {
      headers: authHeaders(accessToken),
    }),
    {
      loading: 'Đang xóa sản phẩm...',
      success: <b>Xóa sản phẩm thành công!</b>,
      error: (error) => {
        const errorMessage = error.response?.data?.message || 'Lỗi hệ thống!';
        return <b>{errorMessage}</b>;
      },
    },
    {
      duration: 1500, // Thời gian hiển thị cho success (tùy chọn)
    },
  );
};
