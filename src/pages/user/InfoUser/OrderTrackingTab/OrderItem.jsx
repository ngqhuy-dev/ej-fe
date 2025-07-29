import { memo, useMemo } from 'react';
import useOrderItem from '@hooks/user/useOrderItem';
import { updateOrderStatus } from '../../../../services/OrderService';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess } from '@/redux/authSlice.jsx';
import { createAxios } from '@utils/createInstance.jsx';
import { useNavigate } from 'react-router-dom';

const OrderItem = ({ item, onNavigate, fetchOrders, activeTab }) => {
  const {
    orderDate,
    statusText,
    paymentText,
    receivedButtonText,
    /*     refundButtonText,
    showRefundButton,
    handleBuyAgain,
    handleRefundClick, */
    handleDetailClick,
  } = useOrderItem({ item, onNavigate });

  console.log(item.status, item._id);

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const user = useSelector((state) => state.auth.login.currentUser);

  const { accessToken, axiosJWT } = useMemo(() => {
    if (!user) return { accessToken: null, axiosJWT: null };

    return {
      accessToken: user.accessToken,
      axiosJWT: createAxios(user, dispatch, loginSuccess),
    };
  }, [user, dispatch]);

  const handleUpdateOrderStatus = async () => {
    try {
      // Xác định trạng thái tiếp theo
      const nextStatus = getNextStatus(item.status);
      if (!nextStatus) {
        console.warn('Không thể cập nhật trạng thái từ:', item.status);
        return;
      }

      await updateOrderStatus(item._id, nextStatus, accessToken, axiosJWT);
      fetchOrders(activeTab);
    } catch (error) {
      console.error('Error updating order status:', error);
      throw error;
    }
  };

  console.log(item);

  const handleProductDetail = (id) => {
    navigate(`/product/${id}`, {
      state: {
        activeTab: 'reviews',
        product: {
          _id: item.id,
        },
        user: {
          _id: user._id,
        },
      },
    });
  };

  // Hàm helper để xác định trạng thái tiếp theo
  const getNextStatus = (currentStatus) => {
    const statusFlow = {
      pending: 'processing',
      processing: 'shipping',
      shipping: 'delivered',
      delivered: 'received',
      received: 'received',
      cancelled: 'cancelled',
    };
    return statusFlow[currentStatus];
  };

  return (
    <div className="order-tracking">
      <div className="order__info">
        <span className="info__date">Ngày đặt hàng: {orderDate}</span>
        <span className="info__status">{statusText}</span>
      </div>

      <div className="order__items">
        {item.orderItems.map((orderItem) => (
          <div
            onClick={() => handleProductDetail(orderItem._idProduct._id)}
            key={orderItem._id || orderItem.id}
            className="order__item"
          >
            <div className="item__image">
              <img
                src={
                  (orderItem._idProduct.images &&
                    orderItem._idProduct.images[0] &&
                    orderItem._idProduct.images[0].url) ||
                  ''
                }
                alt={orderItem.name}
                loading="lazy"
              />
            </div>
            <div className="item__details">
              <span className="item__name">{orderItem.name}</span>
              <div className="item__info">
                <span className="item__quantity">Số lượng: {orderItem.quantity}</span>
              </div>
            </div>
            <span className="item__total">Đơn giá: {orderItem.price?.toLocaleString()}đ</span>
          </div>
        ))}
      </div>

      <div className="order__info">
        <span className="info__payment-method">{paymentText}</span>
        <span className="info__total">Thành tiền: {item.totalAmount?.toLocaleString()}đ</span>
      </div>

      <div className="order__footer">
        <span className={item.status === 'received' && 'notification__review'}>
          {item.status === 'received' && 'Vui lòng Click vào sản phẩm để đánh giá.'}
        </span>

        <div className="order__actions">
          <button
            className="btn btn__action-order btn-review__order"
            onClick={handleUpdateOrderStatus}
            disabled={item.status !== 'delivered'}
          >
            {receivedButtonText}
          </button>
          {/* 
          {showRefundButton && (
            <button className="btn btn__action-order btn-cancelled__order" onClick={handleRefundClick}>
              {refundButtonText}
            </button>
          )} */}

          <button className="btn btn__action-order btn-detail__order" onClick={handleDetailClick}>
            Chi tiết
          </button>
        </div>
      </div>
    </div>
  );
};

export default memo(OrderItem);
