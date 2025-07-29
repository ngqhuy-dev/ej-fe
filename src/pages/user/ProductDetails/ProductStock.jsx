// ProductDetails/components/ProductStock.jsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCheck, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';

const ProductStock = ({ quantity, unit }) => {
  return (
    <div className="product-details__stock-status">
      {quantity > 0 ? (
        <span className="in-stock">
          <FontAwesomeIcon icon={faCheck} /> Còn ({quantity} {unit})
        </span>
      ) : (
        <span className="out-of-stock">
          <FontAwesomeIcon icon={faExclamationTriangle} /> hết hàng
        </span>
      )}
    </div>
  );
};

export default ProductStock;
