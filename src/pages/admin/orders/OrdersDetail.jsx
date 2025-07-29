// File: src/pages/admin/OrderDetail.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess } from '@/redux/authSlice.jsx';
import { createAxios } from '@utils/createInstance.jsx';
import { getOrderDetails, updateOrderStatus } from '@services/OrderService';
import ModalUpdateStatus from '@components/features//admin/orders/ModalUpdateStatus';

const STATUS_MAP = {
  pending: 'Chờ xác nhận',
  paid: 'Đã thanh toán',
  processing: 'Đang chuẩn bị hàng',
  shipping: 'Đang giao hàng',
  delivered: 'Đã giao hàng',
  received: 'Đã nhận hàng',
  cancelled: 'Đã hủy',
};

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Chờ xác nhận' },
  { value: 'paid', label: 'Đã thanh toán' },
  { value: 'processing', label: 'Đang chuẩn bị hàng' },
  { value: 'shipping', label: 'Đang giao hàng' },
  { value: 'delivered', label: 'Đã giao hàng' },
  { value: 'received', label: 'Đã nhận hàng' },
  { value: 'cancelled', label: 'Đã hủy' },
];

const OrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.login.currentUser);

  // State management
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updating, setUpdating] = useState(false);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  // Axios instance
  const axiosJWT = user ? createAxios(user, dispatch, loginSuccess) : null;

  // Fetch order data
  useEffect(() => {
    const fetchOrderDetail = async () => {
      if (!user?.accessToken || !id) return;

      try {
        setLoading(true);
        setError(null);

        const response = await getOrderDetails(id, user.accessToken, axiosJWT);

        if (response.success) {
          setOrder(response.data);
        } else {
          setError('Không thể tải thông tin đơn hàng');
        }
      } catch (err) {
        console.error('Error fetching order details:', err);
        setError(err.message || 'Lỗi khi tải chi tiết đơn hàng');
      } finally {
        setLoading(false);
      }
    };

    fetchOrderDetail();
  }, []);

  // Event handlers
  const handleBack = () => {
    navigate('/admin/orders');
  };

  const handleStatusChange = async () => {
    if (!newStatus || newStatus === order.status) {
      setShowStatusModal(false);
      return;
    }

    try {
      setUpdating(true);
      const response = await updateOrderStatus(id, newStatus, user.accessToken, axiosJWT);

      if (response.success) {
        setOrder({ ...order, status: newStatus });
        setShowStatusModal(false);
        // Show success message
      }
    } catch (err) {
      console.error('Error updating order status:', err);
      alert('Lỗi khi cập nhật trạng thái đơn hàng');
    } finally {
      setUpdating(false);
    }
  };

  // Format currency
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND',
    }).format(amount);
  };

  // Format date
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Loading state
  if (loading) {
    return (
      <section className="admin-section">
        <div className="admin-section__header">
          <h2 className="admin-section__title">Chi tiết đơn hàng</h2>
        </div>
        <div className="admin__loading">
          <div className="loading-spinner"></div>
          <p>Đang tải chi tiết đơn hàng...</p>
        </div>
      </section>
    );
  }

  // Error state
  if (error) {
    return (
      <section className="admin-section">
        <div className="admin-section__header">
          <h2 className="admin-section__title">Chi tiết đơn hàng</h2>
          <button className="admin-add__button" onClick={handleBack}>
            Quay lại danh sách
          </button>
        </div>
        <div className="admin__error">
          <p>Lỗi: {error}</p>
          <button onClick={() => window.location.reload()}>Thử lại</button>
        </div>
      </section>
    );
  }

  // No order found
  if (!order) {
    return (
      <section className="admin-section">
        <div className="admin-section__header">
          <h2 className="admin-section__title">Chi tiết đơn hàng</h2>
          <button className="admin-add__button" onClick={handleBack}>
            Quay lại danh sách
          </button>
        </div>
        <div className="admin__not-found">
          <p>Không tìm thấy đơn hàng với ID: {id}</p>
        </div>
      </section>
    );
  }

  // Calculate totals
  const subtotal =
    order.orderItems?.reduce((sum, item) => {
      const itemPrice = item.price * (1 - (item.discount || 0) / 100);
      return sum + item.quantity * itemPrice;
    }, 0) || 0;

  return (
    <div>
      <section className="admin-section">
        <div className="admin-section__header">
          <h2 className="admin-section__title">Chi tiết đơn hàng #{order._id?.slice(-6).toUpperCase()}</h2>
          <div className="admin-section__actions">
            <button
              className="admin-btn admin-btn--primary"
              onClick={() => setShowStatusModal(true)}
              disabled={updating}
            >
              <i className="fas fa-edit"></i>
              Cập nhật trạng thái
            </button>
            <button className="admin-add__button" onClick={handleBack}>
              Quay lại danh sách
            </button>
          </div>
        </div>

        <div className="admin__order-details">
          {/* Order Status Timeline */}
          <div className="admin__order-timeline">
            <h3>Tiến trình đơn hàng</h3>
            <div className="timeline">
              {STATUS_OPTIONS.map((status) => (
                <div
                  key={status.value}
                  className={`timeline-item ${
                    order.status === status.value
                      ? 'active'
                      : STATUS_OPTIONS.findIndex((s) => s.value === order.status) >
                          STATUS_OPTIONS.findIndex((s) => s.value === status.value)
                        ? 'completed'
                        : ''
                  }`}
                >
                  <div className="timeline-marker"></div>
                  <div className="timeline-content">
                    <span className="timeline-title">{status.label}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          {/* Order Information */}
          <div className="admin__order-info-grid">
            <div className="admin__info-card">
              <h3>Thông tin khách hàng</h3>
              <div className="admin__info-group">
                <label>Tên khách hàng:</label>
                <span>{order._idUser?.fullname || 'N/A'}</span>
              </div>
              <div className="admin__info-group">
                <label>Email:</label>
                <span>{order._idUser?.email || 'N/A'}</span>
              </div>
              <div className="admin__info-group">
                <label>Số điện thoại:</label>
                <span>{order._idUser?.phone || 'N/A'}</span>
              </div>
              <div className="admin__info-group">
                <label>Địa chỉ:</label>
                <span className="address-full">
                  {order.shippingAddress.detailed}, {order.shippingAddress.district}, {order.shippingAddress.city},{' '}
                  {order.shippingAddress.province}
                </span>
              </div>
            </div>

            <div className="admin__info-card">
              <h3>Thông tin đơn hàng</h3>
              <div className="admin__info-group">
                <label>Mã đơn hàng:</label>
                <span className="order-id">#{order._id?.toUpperCase()}</span>
              </div>
              <div className="admin__info-group">
                <label>Ngày tạo:</label>
                <span>{formatDate(order.createdAt)}</span>
              </div>
              <div className="admin__info-group">
                <label>Trạng thái:</label>
                <span>{STATUS_MAP[order.status] || order.status}</span>
              </div>
              <div className="admin__info-group">
                <label>Thanh toán:</label>
                <span>{order.isPaid ? 'Đã thanh toán' : 'Chưa thanh toán'}</span>
              </div>
              <div className="admin__info-group">
                <label>Phương thức thanh toán:</label>
                <span>{order.paymentMethod?.toUpperCase()}</span>
              </div>
              {order.paidAt && (
                <div className="admin__info-group">
                  <label>Ngày thanh toán:</label>
                  <span>{formatDate(order.paidAt)}</span>
                </div>
              )}
              {order.deliveredAt && (
                <div className="admin__info-group">
                  <label>Ngày giao hàng:</label>
                  <span>{formatDate(order.deliveredAt)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Order Note */}
          {order.note && (
            <div className="admin__order-note">
              <h3>Ghi chú đơn hàng</h3>
              <div className="note-content">
                <p>{order.note}</p>
              </div>
            </div>
          )}

          {/* Order Items */}
          <div className="admin__order-items">
            <h3 className="admin__section-subtitle">
              Sản phẩm trong đơn hàng ({order.orderItems?.length || 0} sản phẩm)
            </h3>
            {order.orderItems && order.orderItems.length > 0 ? (
              <div className="block__table">
                <table className="admin__table">
                  <thead>
                    <tr>
                      <th>Hình ảnh</th>
                      <th>Tên sản phẩm</th>
                      <th>Số lượng</th>
                      <th>Đơn giá</th>
                      <th>Giảm giá</th>
                      <th>Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.orderItems.map((item, index) => {
                      const discountedPrice = item.price * (1 - (item.discount || 0) / 100);
                      const itemTotal = item.quantity * discountedPrice;

                      return (
                        <tr key={index}>
                          <td>
                            <img
                              src={item._idProduct?.images[1]?.url || 'https://via.placeholder.com/100?text=No+Image'}
                              alt={item.name}
                              className="admin__image-preview admin__image-preview--order"
                              onError={(e) => {
                                e.target.src = 'https://via.placeholder.com/100?text=No+Image';
                              }}
                            />
                          </td>
                          <td>
                            <div className="product-info">
                              <strong>{item.name}</strong>
                            </div>
                          </td>
                          <td>
                            <span className="quantity-badge">{item.quantity}</span>
                          </td>
                          <td>{formatCurrency(item.price)}</td>
                          <td>
                            {item.discount ? (
                              <span className="discount-badge">-{item.discount}%</span>
                            ) : (
                              <span className="no-discount">Không</span>
                            )}
                          </td>
                          <td>
                            <strong>{formatCurrency(itemTotal)}</strong>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="admin__empty-state">
                <p>Không có sản phẩm trong đơn hàng này.</p>
              </div>
            )}
          </div>

          {/* Order Summary */}
          <div className="admin__order-summary">
            <div className="admin__order-summary-item">
              <span>Tạm tính:</span>
              <span>{formatCurrency(subtotal)}</span>
            </div>
            <div className="admin__order-summary-item">
              <span>Phí vận chuyển:</span>
              <span>{formatCurrency(order.shippingFee || 0)}</span>
            </div>
            {order.discount && (
              <div className="admin__order-summary-item">
                <span>Giảm giá:</span>
                <span className="discount-amount">-{formatCurrency(order?.discount) || 0}</span>
              </div>
            )}
            <div className="admin__order-summary-item admin__order-summary-item--total">
              <span>Tổng cộng:</span>
              <span>{formatCurrency(order.totalAmount)}</span>
            </div>
          </div>
        </div>
        {/* Status Update Modal */}
        {showStatusModal && (
          <ModalUpdateStatus
            order={order}
            setShowStatusModal={setShowStatusModal}
            handleStatusChange={handleStatusChange}
            updating={updating}
            newStatus={newStatus}
            setNewStatus={setNewStatus}
            STATUS_MAP={STATUS_MAP}
            STATUS_OPTIONS={STATUS_OPTIONS}
          />
        )}
      </section>
    </div>
  );
};

export default OrderDetail;
