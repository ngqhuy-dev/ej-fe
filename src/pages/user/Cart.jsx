import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { faMinus, faPlus, faArrowLeft } from '@fortawesome/free-solid-svg-icons';

import NotFound from './NotFound';
import PageLoad from '../PageLoad';
import cartEmpty from '@assets/icons/cartEmpty.svg';
import { loginSuccess } from '@/redux/authSlice.jsx';
import { createAxios } from '@utils/createInstance.jsx';
import Breadcrumb from '@components/common/ui/Breadcrumb';
import { getCart, deleteItemInCart, updateItemInCart } from '@services/CartService';
import { getAllDiscount } from '@services/DiscountService'; // Import thêm getAllDiscount
import { toast } from 'react-hot-toast'; // Import toast

const Cart = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.login.currentUser);

  const [cartItems, setCartItems] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [couponCode, setCouponCode] = useState('');

  // Thêm state cho discount
  const [appliedDiscount, setAppliedDiscount] = useState(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const isAllSelected = selectedItems.length === cartItems.length;

  const { accessToken, axiosJWT } = useMemo(() => {
    if (!user) return { accessToken: null, axiosJWT: null };

    return {
      accessToken: user.accessToken,
      axiosJWT: createAxios(user, dispatch, loginSuccess),
    };
  }, [user, dispatch]);

  const fetchCartItems = useCallback(async () => {
    try {
      setLoading(true);

      const response = await getCart(accessToken, axiosJWT);

      if (response.success && Array.isArray(response.data)) {
        setCartItems(response.data);
      } else {
        setCartItems([]);
      }
    } catch (err) {
      setError('Không thể tải giỏ hàng. Vui lòng thử lại sau.');
      console.error('Error fetching cart:', err);
    } finally {
      setLoading(false);
    }
  }, [accessToken, axiosJWT]);

  useEffect(() => {
    const itemCount = sessionStorage.getItem('itemCount');
    if (parseInt(itemCount) > 0) {
      fetchCartItems();
    }
  }, [fetchCartItems]);

  const handleQuantityChange = useCallback(
    async (itemId, change, oldQuantity) => {
      try {
        const newQuantity = oldQuantity + change;
        if (newQuantity < 1) return;

        const formData = {
          productId: itemId,
          quantity: newQuantity,
        };

        const response = await updateItemInCart(formData, accessToken, axiosJWT);

        if (response?.success) {
          setCartItems((prevItems) =>
            prevItems.map((item) => (item._id === itemId ? { ...item, quantity: newQuantity } : item)),
          );
        }
      } catch (error) {
        console.error('Error updating quantity:', error);
      }
    },
    [accessToken, axiosJWT],
  );

  const handleQuantityInput = useCallback(
    async (itemId, value) => {
      try {
        const newQuantity = parseInt(value);
        if (isNaN(newQuantity) || newQuantity < 1) return;

        const formData = {
          productId: itemId,
          quantity: newQuantity,
        };

        const response = await updateItemInCart(formData, accessToken, axiosJWT);

        if (response.success) {
          setCartItems((prevItems) =>
            prevItems.map((item) => (item._id === itemId ? { ...item, quantity: newQuantity } : item)),
          );
        }
      } catch (error) {
        console.error('Error updating quantity:', error);
      }
    },
    [accessToken, axiosJWT],
  );

  const handleSelectItem = useCallback((itemId) => {
    setSelectedItems((prev) => {
      if (prev.includes(itemId)) {
        return prev.filter((id) => id !== itemId);
      } else {
        return [...prev, itemId];
      }
    });
  }, []);

  const unselectItem = useCallback((itemId) => {
    setSelectedItems((prev) => prev.filter((id) => id !== itemId));
  }, []);

  const handleRemoveItem = useCallback(
    async (itemId) => {
      try {
        const res = await deleteItemInCart(itemId, accessToken, axiosJWT);
        if (res.success) {
          setCartItems((prevItems) => prevItems.filter((item) => item._id !== itemId));
          unselectItem(itemId);
        } else {
          console.error('Delete failed:', res.message);
        }
      } catch (error) {
        console.error('Error deleting item:', error);
      }
    },
    [accessToken, axiosJWT, unselectItem],
  );

  const handleProductClick = useCallback(
    (product) => {
      if (!product || !product._id) return;
      navigate(`/product/${product._id}`);
    },
    [navigate],
  );

  const handleSelectAll = useCallback(() => {
    if (isAllSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map((item) => item._id));
    }
  }, [isAllSelected, cartItems]);

  const calculateSubtotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      if (selectedItems.includes(item._id)) {
        return total + item.discountPrice * item.quantity;
      }
      return total;
    }, 0);
  }, [cartItems, selectedItems]);

  // Cập nhật hàm tính toán giảm giá từ coupon
  const calculateCouponDiscount = useMemo(() => {
    if (!appliedDiscount || calculateSubtotal === 0) return 0;

    const currentDate = new Date();
    const activationDate = new Date(appliedDiscount.activation);
    const expirationDate = new Date(appliedDiscount.expiration);

    // Kiểm tra thời hạn của mã giảm giá
    if (currentDate < activationDate || currentDate > expirationDate) {
      return 0;
    }

    // Kiểm tra giá trị đơn hàng tối thiểu
    if (calculateSubtotal < appliedDiscount.minOrderAmount) {
      return 0;
    }

    let discount = 0;

    if (appliedDiscount.type === 'percentage') {
      discount = (calculateSubtotal * appliedDiscount.maxPercent) / 100;
    } else if (appliedDiscount.type === 'fixed') {
      discount = appliedDiscount.value;
      if (discount > calculateSubtotal) {
        discount = calculateSubtotal;
      }
    }

    return discount;
  }, [appliedDiscount, calculateSubtotal]);

  const calculateTotal = useMemo(() => {
    const shipping = calculateSubtotal >= 500000 ? 0 : 30000;
    return calculateSubtotal + shipping - calculateCouponDiscount;
  }, [calculateSubtotal, calculateCouponDiscount]);

  const getSelectedProductsData = useMemo(() => {
    return cartItems
      .filter((item) => selectedItems.includes(item._id))
      .map((item) => {
        return {
          ...item,
        };
      });
  }, [cartItems, selectedItems]);

  // Cập nhật hàm áp dụng mã giảm giá
  const handleApplyCoupon = useCallback(async () => {
    if (!couponCode.trim()) {
      toast.error('Vui lòng nhập mã giảm giá!');
      return;
    }

    if (calculateSubtotal === 0) {
      toast.error('Vui lòng chọn sản phẩm trước khi áp dụng mã giảm giá!');
      return;
    }

    try {
      setIsApplyingCoupon(true);

      // Tìm mã giảm giá theo code trong danh sách tất cả mã
      const allDiscounts = await getAllDiscount();

      if (!Array.isArray(allDiscounts) || allDiscounts.length === 0) {
        toast.error('Không thể tải danh sách mã giảm giá!');
        return;
      }

      // Tìm mã giảm giá có code khớp
      const discount = allDiscounts.find((item) => item.code && item.code.toUpperCase() === couponCode.toUpperCase());

      if (!discount) {
        toast.error('Mã giảm giá không tồn tại!');
        return;
      }

      // Kiểm tra trạng thái mã giảm giá
      if (!discount.isActive) {
        toast.error('Mã giảm giá đã hết hạn sử dụng!');
        return;
      }

      // Kiểm tra thời hạn
      const currentDate = new Date();
      const activationDate = new Date(discount.activation);
      const expirationDate = new Date(discount.expiration);

      if (currentDate < activationDate) {
        toast.error('Mã giảm giá chưa có hiệu lực!');
        return;
      }

      if (currentDate > expirationDate) {
        toast.error('Mã giảm giá đã hết hạn!');
        return;
      }

      // Kiểm tra giá trị đơn hàng tối thiểu
      if (calculateSubtotal < discount.minOrderAmount) {
        toast.error(
          `Đơn hàng phải có giá trị tối thiểu ${discount.minOrderAmount.toLocaleString()}đ để áp dụng mã này!`,
        );
        return;
      }

      // Kiểm tra số lượng sử dụng
      if (discount.quantityLimit && discount.quantityUsed >= discount.quantityLimit) {
        toast.error('Mã giảm giá đã hết lượt sử dụng!');
        return;
      }

      // Áp dụng mã giảm giá thành công
      setAppliedDiscount({
        ...discount,
        id: discount._id || discount.id, // Lưu ID của mã giảm giá
      });
      toast.success(`Áp dụng mã giảm giá "${discount.code}" thành công!`);

      // Log ID mã giảm giá để debug
      console.log('Applied discount ID:', discount._id || discount.id);
    } catch (error) {
      console.error('Error applying coupon:', error);
      toast.error('Có lỗi xảy ra khi áp dụng mã giảm giá!');
    } finally {
      setIsApplyingCoupon(false);
    }
  }, [couponCode, calculateSubtotal]);

  // Hàm hủy mã giảm giá
  const handleRemoveCoupon = useCallback(() => {
    setAppliedDiscount(null);
    setCouponCode('');
    toast.success('Đã hủy mã giảm giá!');
  }, []);

  if (loading) {
    return <PageLoad zIndex={1} />;
  }

  if (error) {
    return <NotFound />;
  }

  return (
    <>
      <Breadcrumb items={[{ text: 'Cart' }]} />
      <div className="cart">
        <div className="cart__container">
          <div className="cart__items">
            <div className="cart__select-all">
              <input
                type="checkbox"
                checked={cartItems.length !== 0 && selectedItems.length === cartItems.length}
                onChange={handleSelectAll}
              />
              <span>Chọn tất cả</span>
            </div>
            {cartItems.length !== 0 ? (
              cartItems.map((item) => (
                <div key={item._id} className="cart__item">
                  <div className="cart__item-checkbox">
                    <input
                      type="checkbox"
                      checked={selectedItems.includes(item._id)}
                      onChange={() => handleSelectItem(item._id)}
                    />
                  </div>
                  <div className="cart__item-image">
                    <img src={item.images[0].url} alt={item.name} />
                  </div>

                  <div className="cart__item-details">
                    <h3 className="cart__item-name">{item.name}</h3>
                    <p className="cart__item-seller"></p>
                    <p className="cart__item-weight"></p>

                    <div className="cart__item-price">
                      <span className="current-price">
                        {item.discountPrice.toLocaleString()}đ/{item.unit}
                      </span>
                      <span className="original-price">{item.price.toLocaleString()}đồng</span>{' '}
                      <span className="savings">Tiết kiệm : {(item.price - item.discountPrice).toLocaleString()}đ</span>
                    </div>
                  </div>

                  <div className="cart__item-quantity">
                    <div className="quantity-label">Số lượng</div>
                    <div className="quantity-controls">
                      <button
                        onClick={() => handleQuantityChange(item._id, -1, item.quantity)}
                        className="quantity-btn"
                        disabled={item.quantity <= 1}
                      >
                        <FontAwesomeIcon icon={faMinus} />
                      </button>
                      <input
                        type="number"
                        className="quantity-value"
                        value={item.quantity}
                        onChange={(e) => handleQuantityInput(item._id, e.target.value)}
                        min="1"
                      />
                      <button onClick={() => handleQuantityChange(item._id, 1, item.quantity)} className="quantity-btn">
                        <FontAwesomeIcon icon={faPlus} />
                      </button>
                    </div>
                  </div>

                  <div className="cart__item-total">
                    <div className="total-label">Thành tiền</div>
                    <div className="total-value">{(item.discountPrice * item.quantity).toLocaleString()}đ</div>
                  </div>

                  <div className="cart__item-actions">
                    <button className="remove" onClick={() => handleRemoveItem(item._id)}>
                      Remove
                    </button>
                    <button onClick={() => handleProductClick(item)}>Xem chi tiết</button>
                  </div>
                </div>
              ))
            ) : (
              <img className="img__empty" src={cartEmpty} alt="Cart Empty" />
            )}
          </div>

          <div className="cart__summary">
            <h2>Giỏ hàng chi tiết</h2>
            <div className="cart__coupon">
              <div className="coupon-label">Áp dụng mã giảm giá</div>
              {!appliedDiscount ? (
                <div className="coupon-input">
                  <input
                    type="text"
                    placeholder="Nhập mã giảm giá..."
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                    disabled={isApplyingCoupon}
                  />
                  <button onClick={handleApplyCoupon} disabled={isApplyingCoupon || !couponCode.trim()}>
                    {isApplyingCoupon ? 'Đang áp dụng...' : 'Áp dụng'}
                  </button>
                </div>
              ) : (
                <div className="coupon-applied">
                  <div className="coupon-info">
                    <span className="coupon-code">Mã: {appliedDiscount.code}</span>
                    <span className="coupon-discount">
                      Giảm:{' '}
                      {appliedDiscount.type === 'percentage'
                        ? `${appliedDiscount.maxPercent}%`
                        : `${appliedDiscount.value.toLocaleString()}đ`}
                    </span>
                  </div>
                  <button className="btn btn-cancel__coupon" onClick={handleRemoveCoupon}>
                    Hủy
                  </button>
                </div>
              )}
            </div>
            <div className="cart__totals">
              <div className="subtotal">
                <span>Thành tiền</span>
                <span>{calculateSubtotal.toLocaleString()} đồng</span>
              </div>
              <div className="subtotal">
                <span>Phí vận chuyển</span>
                <span>{(calculateSubtotal >= 500000 ? 0 : 30000).toLocaleString()} đồng</span>
              </div>
              {calculateCouponDiscount > 0 && (
                <div className="coupon-discount">
                  <span>Mã giảm giá</span>
                  <span className="discount-amount">-{calculateCouponDiscount.toLocaleString()} đồng</span>
                </div>
              )}
              <div className="total">
                <span>Tổng</span>
                <span className="total-amount">{calculateTotal.toLocaleString()} đồng</span>
              </div>
            </div>
            <span
              className="notify__shipping"
              style={{ paddingBottom: '20px', display: 'block', color: 'red', lineHeight: '26px' }}
            >
              * Miễn phí vận chuyển đơn hàng với giá trị trên 500.000đ*
            </span>
            <Link
              to="/checkout?source=cart"
              state={{
                selectedProducts: getSelectedProductsData,
                appliedDiscount: appliedDiscount ?? null,
                summary: {
                  shipping: calculateSubtotal >= 500000 ? 0 : 30000,
                  subtotal: calculateSubtotal,
                  couponDiscount: calculateCouponDiscount,
                  total: calculateTotal,
                },
              }}
            >
              <button className="checkout-btn" disabled={selectedItems.length === 0}>
                Thanh toán ({selectedItems.length} sản phẩm)
              </button>
            </Link>
            <Link to="/product" className="return-link">
              <FontAwesomeIcon icon={faArrowLeft} /> Tiếp tục mua hàng
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Cart;
