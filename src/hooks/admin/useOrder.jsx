// src/hooks/useOrders.js
import { useState, useCallback } from 'react';
import { getAllOrders, updateOrderStatus } from '@/services/OrderService';

export const useOrders = (user, axiosJWT) => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchOrders = useCallback(
    async (status) => {
      if (!user?.accessToken) return;
      setLoading(true);
      try {
        const res = await getAllOrders(status, user.accessToken, axiosJWT);
        setOrders(res.success ? res.data : []);
      } catch (err) {
        console.error('Fetch orders error:', err);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    },
    [user, axiosJWT],
  );

  const updateStatus = async (order, getNextStatus) => {
    const next = getNextStatus(order.status);
    if (!next) return;
    await updateOrderStatus(order._id, next, user.accessToken, axiosJWT);
    fetchOrders(order.status);
  };

  return { orders, loading, fetchOrders, updateStatus };
};
