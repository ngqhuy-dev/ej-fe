// ProductDetails/components/ProductInfo.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { addItemToCart } from '@services/CartService';
import { toast } from 'react-toastify';
import ProductRating from './ProductRating';
import ProductPrice from './ProductPrice';
import ProductStock from './ProductStock';
import ProductActions from './ProductActions';
import ProductInfoBlocks from './ProductInfoBlocks';

const ProductInfo = ({ product, accessToken, axiosJWT, dispatch }) => {
  const navigate = useNavigate();
  const [quantity, setQuantity] = useState(1);

  const handleQuantityChange = (value) => {
    const newQuantity = Math.max(1, Math.min(product.quantity, quantity + value));
    setQuantity(newQuantity);
  };

  const handleQuantityInput = (e) => {
    const value = parseInt(e.target.value) || 0;
    const newQuantity = Math.max(1, Math.min(product.quantity, value));
    setQuantity(newQuantity);
  };

  const handleAddToCart = async () => {
    if (!product || !product._id) return;

    const formData = {
      productId: product._id,
      quantity: quantity,
    };
    if (!accessToken || !axiosJWT) {
      toast.dismiss();
      toast('Vui lòng đăng nhập', {
        icon: '⚠️',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
        duration: 2000,
        position: 'top-center',
      });
      navigate('/login');
    } else {
      await addItemToCart(formData, dispatch, accessToken, axiosJWT);
    }
  };

  const handleBuyNow = () => {
    if (!product || !product._id) {
      toast.error('Không thể mua sản phẩm này');
      return;
    }

    if (!accessToken || !axiosJWT) {
      toast.dismiss();
      toast('Vui lòng đăng nhập', {
        icon: '⚠️',
        style: {
          borderRadius: '10px',
          background: '#333',
          color: '#fff',
        },
        duration: 2000,
        position: 'top-center',
      });
      navigate('/login');
    } else {
      const discountPrice = product.discountPrice || product.price;
      const totalDiscountPrice = discountPrice * quantity;

      const selectedProduct = {
        _id: product._id,
        name: product.name,
        images: product.images || [],
        discountPrice,
        quantity,
        totalDiscountPrice,
      };

      const subtotal = totalDiscountPrice;
      const shipping = 30000;
      const couponDiscount = 0;
      const total = subtotal + shipping - couponDiscount;

      const summary = { subtotal, shipping, couponDiscount, total };

      console.log(selectedProduct);
      navigate('/checkout', {
        state: { selectedProducts: [selectedProduct], summary },
      });
    }
  };

  return (
    <div className="product-details__info">
      <h1 className="product-details__title">{product.name}</h1>

      <ProductRating averageRating={product.averageRating} reviews={product.reviews} />

      <ProductPrice price={product.price} discount={product.discount} unit={product.unit} />

      <ProductStock quantity={product.quantity} unit={product.unit} />

      <ProductActions
        product={product}
        quantity={quantity}
        onQuantityChange={handleQuantityChange}
        onQuantityInput={handleQuantityInput}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      <ProductInfoBlocks />
    </div>
  );
};

export default ProductInfo;
