import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMapMarkerAlt, faArrowLeft, faSpinner, faShoppingBag } from '@fortawesome/free-solid-svg-icons';
import { useLocation, Link, useSearchParams, useNavigate } from 'react-router-dom';

import { toast } from 'react-toastify';

import Breadcrumb from '@components/common/ui/Breadcrumb';
import ModalAddress from '@pages/user/InfoUser/AddressTab/ModalAddress';
import paymentMethods from '@json/paymentMethod';
import { loginSuccess } from '@/redux/authSlice.jsx';
import { createAxios } from '@utils/createInstance.jsx';

import { createOrder } from '@services/OrderService';
import { paymentService } from '@services/PaymentService';
import { useDispatch, useSelector } from 'react-redux';

const Checkout = () => {
  // State management
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [selectedPayment, setSelectedPayment] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Router hooks
  const user = useSelector((state) => state.auth.login.currentUser);
  const accessToken = user?.accessToken;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const axiosJWT = createAxios(user, dispatch, loginSuccess);
  const location = useLocation();

  const [searchParams] = useSearchParams();
  const source = searchParams.get('source');

  // Get cart data from location state or redirect if empty
  const { selectedProducts = [], summary = {}, appliedDiscount = {} } = location.state || {};

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    if (!selectedAddress) {
      newErrors.address = 'Vui lòng chọn địa chỉ giao hàng';
    }
    if (!selectedPayment) {
      newErrors.payment = 'Vui lòng chọn phương thức thanh toán';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle order placement
  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      toast.error('Vui lòng kiểm tra lại thông tin đơn hàng');
      return;
    }

    try {
      setIsLoading(true);

      console.log('orderItems', selectedProducts);
      console.log('shippingAddress', selectedAddress);
      console.log('paymentMethod', selectedPayment);
      console.log('totalAmount', summary.total);
      console.log('shippingFee', summary.shipping);
      console.log('note', '');
      console.log('source', source);

      const orderItem = selectedProducts.map((product) => ({
        _idProduct: product._id,
        name: product.name,
        quantity: product.quantity,
        price: product.discountPrice,
      }));
      const response = await createOrder(
        {
          orderItems: orderItem,
          shippingAddress: selectedAddress._id,
          shippingFee: summary.shipping,
          paymentMethod: selectedPayment,
          totalAmount: summary.total,
          discount: appliedDiscount ? appliedDiscount._id : null,
          note: '',
          source,
        },
        dispatch,
        accessToken,
        axiosJWT,
      );
      if (response.success) {
        toast.success('Đặt hàng thành công!', {
          position: 'top-center',
          autoClose: 2000,
        });
        if (response.data.paymentMethod === 'vnpay') {
          const res = await paymentService(response.data._id, accessToken, axiosJWT);
          if (res.success && res.paymentUrl) {
            window.location.href = res.paymentUrl;
          }
        } else {
          navigate('/product');
        }
      }
    } catch (error) {
      toast.error('Có lỗi xảy ra khi đặt hàng. Vui lòng thử lại!');
      console.error('Order error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Breadcrumb items={[{ text: 'Cart', link: '/cart' }, { text: 'Checkout' }]} />
      <div className="checkout">
        <div className="checkout__container">
          <div className="checkout__main">
            {/* Delivery Address Section */}
            <section className="checkout__section">
              <div className="section__header">
                <div className="section__title">
                  <FontAwesomeIcon icon={faMapMarkerAlt} />
                  <h2>Địa chỉ giao hàng</h2>
                </div>
                <div className="section__button">
                  <button className="btn btn-change__address" onClick={() => setShowAddressModal(true)}>
                    {selectedAddress ? 'Thay đổi' : 'Chọn địa chỉ'}
                  </button>
                </div>
                {showAddressModal && (
                  <ModalAddress
                    onClose={() => setShowAddressModal(false)}
                    onSelect={(addr) => {
                      setSelectedAddress(addr);
                      setShowAddressModal(false);
                    }}
                  />
                )}
              </div>
              {errors.address && <div className="error-message">{errors.address}</div>}
              <div className="address__options">
                {selectedAddress && (
                  <div key={selectedAddress._id} className="address__card selected">
                    <h3>
                      {selectedAddress._idUser?.fullname} | {selectedAddress._idUser?.phone}
                    </h3>
                    <p>{selectedAddress.detailed}</p>
                    <p>
                      {selectedAddress.district}, {selectedAddress.city}, {selectedAddress.province}
                    </p>
                  </div>
                )}
                {!selectedAddress && (
                  <div className="address__empty">
                    <p>Vui lòng chọn địa chỉ giao hàng</p>
                  </div>
                )}
              </div>
            </section>

            {/* Order Items Section */}
            <section className="checkout__section">
              <div className="section__header">
                <div className="section__title">
                  <FontAwesomeIcon icon={faShoppingBag} />
                  <h2>Sản phẩm</h2>
                </div>
              </div>
              <div className="order__items">
                {selectedProducts.map((item) => (
                  <div key={item._id || item.id} className="order__item">
                    <div className="item__image">
                      <img src={(item.images && item.images[0] && item.images[0].url) || ''} alt={item.name} />
                    </div>
                    <div className="item__details">
                      <span className="item__name">{item.name}</span>
                      <div className="item__info">
                        <span className="item__quantity">Số lượng: {item.quantity}</span>
                        <span className="item__price">Đơn giá: {item.discountPrice?.toLocaleString()}đ</span>
                      </div>
                    </div>
                    <span className="item__total">{item.totalDiscountPrice?.toLocaleString()}đ</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Order Summary Section */}
          <aside className="checkout__summary">
            <h2>Tóm tắt đơn hàng</h2>

            <div className="order__totals">
              <div className="total__row">
                <span>Thành tiền</span>
                <span>{summary.subtotal?.toLocaleString()}đ</span>
              </div>
              <div className="total__row">
                <span>Phí vận chuyển</span>
                <span>{summary.shipping?.toLocaleString()}đ</span>
              </div>
              <div className="total__row coupon">
                <span>Mã giảm giá</span>
                <span className="discount">-{summary.couponDiscount?.toLocaleString()}đ</span>
              </div>
              <div className="total__row final">
                <span>Tổng thanh toán</span>
                <span>{summary.total?.toLocaleString()}đ</span>
              </div>

              <div className="total__row payment">
                {errors.payment && <div className="error-message">{errors.payment}</div>}
                <div className="payment__options">
                  {paymentMethods.map((method) => (
                    <div key={method.id} className="payment__option">
                      <input
                        id={method.id}
                        type="radio"
                        name="payment"
                        value={method.id}
                        checked={selectedPayment === method.id}
                        onChange={(e) => setSelectedPayment(e.target.value)}
                      />
                      <label htmlFor={method.id} className="option__content">
                        <span>{method.name}</span>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button
              className="place-order__btn"
              onClick={handlePlaceOrder}
              disabled={isLoading || !selectedAddress || !selectedPayment}
            >
              {isLoading ? (
                <>
                  <FontAwesomeIcon icon={faSpinner} spin /> Đang xử lý...
                </>
              ) : (
                'Đặt hàng'
              )}
            </button>

            <Link to="/cart" className="return-link">
              <FontAwesomeIcon icon={faArrowLeft} /> Quay lại giỏ hàng
            </Link>
          </aside>
        </div>
      </div>
    </>
  );
};

export default Checkout;
