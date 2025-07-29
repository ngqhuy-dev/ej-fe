// ProductDetails/components/ProductActions.jsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCartPlus } from '@fortawesome/free-solid-svg-icons';

const ProductActions = ({ product, quantity, onQuantityChange, onQuantityInput, onAddToCart, onBuyNow }) => {
  return (
    <div className="product-details__actions">
      <div className="quantity-selector">
        <button onClick={() => onQuantityChange(-1)} disabled={quantity <= 1}>
          -
        </button>
        <input type="number" value={quantity} onChange={onQuantityInput} min="1" max={product.quantity} />
        <button onClick={() => onQuantityChange(1)} disabled={quantity >= product.quantity}>
          +
        </button>
      </div>

      <button className="add-to-cart" disabled={product.quantity <= 0} onClick={onAddToCart}>
        <FontAwesomeIcon icon={faCartPlus} /> Thêm vào giỏ hàng
      </button>

      <button className="buy-now" disabled={product.quantity <= 0} onClick={onBuyNow}>
        Mua
      </button>
    </div>
  );
};

export default ProductActions;
