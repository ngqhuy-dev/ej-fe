// ProductDetails/components/ProductRating.jsx
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faStar } from '@fortawesome/free-solid-svg-icons';

const ProductRating = ({ averageRating, reviews }) => {
  return (
    <div className="product-details__rating">
      <div className="stars">
        {[...Array(5)].map((_, index) => (
          <FontAwesomeIcon key={index} icon={faStar} className={index < Math.floor(averageRating) ? 'filled' : ''} />
        ))}
        <span>{averageRating}</span>
      </div>
      <span className="divider">•</span>
      <span>{reviews} đánh giá</span>
    </div>
  );
};

export default ProductRating;
