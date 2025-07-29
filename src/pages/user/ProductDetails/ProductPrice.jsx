// ProductDetails/components/ProductPrice.jsx
const ProductPrice = ({ price, discount, unit }) => {
  const discountedPrice = price - price * (discount / 100);

  return (
    <div className="product-details__price">
      <span className="current-price">
        {discountedPrice.toLocaleString()}đ/{unit}
      </span>
      {discount > 0 && <span className="original-price">{price.toLocaleString()}đồng</span>}
    </div>
  );
};

export default ProductPrice;
