// File: src/pages/admin/Orders.jsx
import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Modal from '@components/common/ui/Modal';
import Pagination from '@components/common/ui/Pagination';
import HeaderStatusOrder from '../../../components/common/ui/HeaderStatusOrder';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess } from '@/redux/authSlice.jsx';
import { createAxios } from '@utils/createInstance.jsx';
import { getAllOrders, updateOrderStatus, deleteOrder } from '../../../services/OrderService';
import socket from '@/socket';

const STATUS_MAP = {
  all: 'Tất cả',
  pending: 'Chờ xác nhận',
  paid: 'Đã thanh toán',
  processing: 'Đang chuẩn bị hàng',
  shipping: 'Đang giao hàng',
  delivered: 'Đã giao hàng',
  received: 'Đã nhân',
  cancelled: 'Đã hủy',
};

const STATUS_ENTRIES = Object.entries(STATUS_MAP);

const Orders = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.login.currentUser);
  const [searchParams] = useSearchParams();

  // States
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 10;
  const activeTab = searchParams.get('status') || 'pending';

  // Axios instance
  const axiosJWT = user ? createAxios(user, dispatch, loginSuccess) : null;

  // Hàm helper để xác định trạng thái tiếp theo
  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      pending: 'processing',
      paid: 'processing',
      processing: 'shipping',
      shipping: 'delivered',
      delivered: 'received',
      received: 'received',
      cancelled: 'cancelled',
    };
    return statusFlow[currentStatus];
  };

  // Navigation handlers
  const handleViewOrder = (id) => navigate(`/admin/orders/${id}`);

  // Delete order handlers
  const handleDeleteOrder = (order) => {
    setOrderToDelete(order);
    setIsDeleteModalOpen(true);
  };

  const handleUpdateOrderStatus = async (order) => {
    try {
      const nextStatus = getNextStatus(order.status);
      if (!nextStatus || nextStatus === order.status) {
        console.warn('Không thể cập nhật trạng thái từ:', order.status);
        return;
      }

      // Gọi API
      await updateOrderStatus(order._id, nextStatus, user.accessToken, axiosJWT);
    } catch (error) {
      console.error('Error updating order status:', error);

      // ✅ Rollback về trạng thái cũ nếu API thất bại
      setOrders((prev) => prev.map((o) => (o._id === order._id ? { ...o, status: order.status } : o)));
    }
  };

  useEffect(() => {
    if (!user || !user?._id) return;

    if (user && user?._id) {
      if (user.isAdmin) {
        // ✅ Admin join admin room
        socket.emit('joinAdmin', user._id);
      } else {
        // User thông thường join user room
        socket.emit('joinUser', user._id);
      }
    }

    const handleStatusChanged = (data) => {
      const { orderId, status } = data;

      setOrders((prev) => {
        const updatedOrders = prev.map((order) => {
          if (order._id === orderId) {
            return { ...order, status };
          }
          return order;
        });

        if (activeTab === 'all') {
          return updatedOrders;
        } else {
          return updatedOrders.filter((order) => {
            if (order._id === orderId) {
              return order.status === activeTab;
            }
            return true;
          });
        }
      });
    };

    socket.on('orderStatusChanged', handleStatusChanged);

    return () => {
      socket.off('orderStatusChanged', handleStatusChanged);
    };
  }, [user, activeTab]);

  const confirmDeleteOrder = async () => {
    if (!orderToDelete) return;

    setLoading(true);

    try {
      await deleteOrder(orderToDelete._id, user.accessToken, axiosJWT);
      setOrders((prev) => prev.filter((o) => o._id !== orderToDelete._id));
      setIsDeleteModalOpen(false);
      setOrderToDelete(null);
    } catch (error) {
      console.error('Error deleting order:', error);
    } finally {
      setLoading(false);
    }
  };

  // Tab navigation
  const handleTabClick = (status) => {
    navigate(`/admin/orders?status=${status}`);
    setCurrentPage(1);
  };

  // Fetch orders
  const fetchOrders = useCallback(
    async (status) => {
      if (!user?.accessToken) return;

      setLoading(true);
      try {
        const response = await getAllOrders(status, user.accessToken, axiosJWT);
        setOrders(response.success ? response.data : []);
      } catch (error) {
        console.error('Error fetching orders:', error);
        setOrders([]);
      } finally {
        setLoading(false);
      }
    },
    [axiosJWT, user],
  );

  // Effects
  useEffect(() => {
    fetchOrders(activeTab);
  }, [activeTab, user]);

  // Filter orders by search term
  const filteredOrders = orders.filter(
    (order) =>
      order._id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._idUser?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order._idUser?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderItems?.some((item) => item.name?.toLowerCase().includes(searchTerm.toLowerCase())),
  );

  // Pagination
  const totalItems = filteredOrders.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentOrders = filteredOrders.slice(startIndex, startIndex + itemsPerPage);

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Get status color
  const getStatusColor = (status) => {
    const colors = {
      pending: '#f0ad4e', // Vàng cam - Đang chờ xử lý
      paid: '#0275d8', // Xanh dương đậm - Đã thanh toán
      processing: '#5bc0de', // Xanh ngọc nhạt - Đang xử lý
      shipping: '#292b2c', // Đen xám - Đang giao hàng
      delivered: '#5cb85c', // Xanh lá tươi - Đã giao
      received: '#5cb85c', // Xanh lá tươi - Đã nhận
      cancelled: '#d9534f', // Đỏ - Đã hủy
    };
    return colors[status] || '#f7f7f7'; // Mặc định: xám rất nhạt
  };

  const getStatusTextColor = (status) => {
    const textColors = {
      pending: '#292b2c',
      paid: '#ffffff',
      processing: '#292b2c',
      shipping: '#ffffff',
      delivered: '#ffffff',
      received: '#ffffff',
      cancelled: '#ffffff',
    };
    return textColors[status] || '#292b2c';
  };

  return (
    <div className="admin-section">
      <div className="admin-section__header">
        <h2 className="admin-section__title">Quản lý đơn hàng</h2>
      </div>

      <div className="admin-section__search">
        <div className="search-box">
          <i className="fas fa-search"></i>
          <input
            type="text"
            placeholder="Tìm kiếm theo mã đơn, khách hàng, sản phẩm..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="admin-orders__tabs">
        <HeaderStatusOrder activeTab={activeTab} handleTabClick={handleTabClick} STATUS_ENTRIES={STATUS_ENTRIES} />
      </div>

      <div className="admin-section__content">
        {loading ? (
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Đang tải dữ liệu...</p>
          </div>
        ) : (
          <>
            <div className="block__table ">
              <table className="admin__table">
                <thead>
                  <tr>
                    <th>Mã đơn</th>
                    <th>Ngày tạo</th>
                    <th>Khách hàng</th>
                    <th>Số liên hệ</th>
                    <th>Sản phẩm</th>
                    <th>Thanh toán</th>
                    <th>Trạng thái</th>
                    <th>Tổng tiền</th>
                    <th>Thao tác</th>
                    <th>Duyệt</th>
                  </tr>
                </thead>
                <tbody>
                  {currentOrders.length > 0 ? (
                    currentOrders.map((order) => (
                      <tr key={order._id}>
                        <td title={order._id}>#{'...' + order._id.slice(-6).toUpperCase()}</td>
                        <td>{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                        <td>{order._idUser?.fullname || 'N/A'}</td>
                        <td>{order._idUser?.phone}</td>
                        <td>{order.orderItems?.length || 0} sản phẩm</td>
                        <td>
                          <div className={`payment-status ${order.isPaid ? 'paid' : 'unpaid'}`}>
                            {order.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}
                          </div>
                        </td>
                        <td>
                          <span
                            className="status-badge"
                            style={{
                              backgroundColor: getStatusColor(order.status),
                              color: getStatusTextColor(order.status),
                              padding: '5px 10px',
                              borderRadius: '5px',
                            }}
                          >
                            {STATUS_MAP[order.status]}
                          </span>
                        </td>
                        <td>{formatCurrency(order.totalAmount)}</td>
                        <td>
                          <div className="table-actions">
                            <button onClick={() => handleViewOrder(order._id)} title="Xem">
                              <i className="fas fa-eye"></i>
                            </button>
                            <button onClick={() => handleDeleteOrder(order)} title="Xóa">
                              <i className="fas fa-trash"></i>
                            </button>
                          </div>
                        </td>
                        <td>
                          <div className="table-actions table-actions__accept">
                            {order.status === 'received' ||
                              (order.status !== 'cancelled' && (
                                <button onClick={() => handleUpdateOrderStatus(order)} title="Xác nhận">
                                  <i className="fas fa-check"></i>
                                </button>
                              ))}
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="8" className="no-data">
                        Không có đơn hàng nào
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {totalPages > 1 && (
              <div className="admin-orders__pagination">
                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
              </div>
            )}
          </>
        )}
      </div>

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setOrderToDelete(null);
        }}
        onConfirm={confirmDeleteOrder}
        title="Xác nhận xóa đơn hàng"
        message={orderToDelete ? `Bạn có chắc chắn muốn xóa đơn hàng "${orderToDelete._id}"?` : ''}
      />
    </div>
  );
};

export default Orders;
