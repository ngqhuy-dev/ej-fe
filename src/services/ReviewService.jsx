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

export const addReview = async (data, dispatch, accessToken, axiosJWT) => {
  dispatch(addStart());
  try {
    const response = await axiosJWT.post(`${API_URL}/reviews/create`, data, {
      headers: authHeaders(accessToken),
    });
    dispatch(addSuccess(response.data));
    dispatch(resetAddState());
    return response.data;
  } catch (error) {
    dispatch(addFailed());
    const errorMessage = error.response?.data?.message || 'Có lỗi xảy ra khi tạo đánh giá';
    toast.error(errorMessage, { position: 'top-center', duration: 2000 });
    throw new Error(errorMessage);
  }
};

export const getReviewById = async (id, accessToken, axiosJWT) => {
  try {
    // Nếu có accessToken và axiosJWT thì dùng authenticated request
    if (accessToken && axiosJWT) {
      const response = await axiosJWT.get(`${API_URL}/reviews/${id}`, {
        headers: authHeaders(accessToken),
      });
      return response.data;
    } else {
      // Nếu không có token thì dùng request thông thường
      const response = await axios.get(`${API_URL}/reviews/${id}`, {
        headers: defaultHeaders,
      });
      return response.data;
    }
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Không thể tải thông tin đánh giá';
    toast.error(errorMessage, { position: 'top-center', duration: 2000 });
    throw new Error(errorMessage);
  }
};

export const getReviewByProduct = async (productId) => {
  try {
    const response = await axios.get(`${API_URL}/reviews/product/${productId}`, {
      headers: defaultHeaders,
    });

    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Không thể tải danh sách đánh giá';
    console.error('Error fetching reviews:', errorMessage);
    throw new Error(errorMessage);
  }
};

export const getAllReviews = async (accessToken, axiosJWT) => {
  try {
    const response = await axiosJWT.get(`${API_URL}/reviews`, {
      headers: authHeaders(accessToken),
    });

    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Không thể tải danh sách đánh giá';
    toast.error(errorMessage, { position: 'top-center', duration: 2000 });
    throw new Error(errorMessage);
  }
};

export const deleteReview = async (id, accessToken, axiosJWT) => {
  if (!accessToken || !axiosJWT) {
    toast.error('Vui lòng đăng nhập lại!', { duration: 2000 });
    throw new Error('Dữ liệu đầu vào không hợp lệ!');
  }
  try {
    const response = await axiosJWT.delete(`${API_URL}/reviews/delete/${id}`, {
      headers: authHeaders(accessToken),
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Không thể xóa đánh giá';
    toast.error(errorMessage, { position: 'top-center', duration: 2000 });
    throw new Error(errorMessage);
  }
};

export const updateReview = async (id, data, accessToken, axiosJWT) => {
  if (!accessToken || !axiosJWT) {
    toast.error('Vui lòng đăng nhập lại!', { duration: 2000 });
    throw new Error('Dữ liệu đầu vào không hợp lệ!');
  }
  try {
    const response = await axiosJWT.patch(`${API_URL}/reviews/update/${id}`, data, {
      headers: authHeaders(accessToken),
    });
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Không thể cập nhật đánh giá';
    toast.error(errorMessage, { position: 'top-center', duration: 2000 });
    throw new Error(errorMessage);
  }
};

export const togglePublish = async (id, accessToken, axiosJWT) => {
  try {
    const response = await axiosJWT.patch(
      `${API_URL}/reviews/publish/${id}`,
      {},
      {
        headers: authHeaders(accessToken),
      },
    );
    return response.data;
  } catch (error) {
    const errorMessage = error.response?.data?.message || 'Không thể cập nhật đánh giá';
    toast.error(errorMessage, { position: 'top-center', duration: 2000 });
    throw new Error(errorMessage);
  }
};
